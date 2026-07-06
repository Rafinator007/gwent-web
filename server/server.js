"use strict";

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Раздаём статику из родительской папки (сама игра)
app.use(express.static(path.join(__dirname, '..')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Хранилище активных комнат: { roomCode -> { players: [socket, socket], seed, hostDeck } }
const rooms = {};

// Генерирует случайный 4-значный код комнаты
function generateCode() {
    let code;
    do {
        code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms[code]);
    return code;
}

// Генерирует seed для синхронизации случайных чисел
function generateSeed() {
    return Math.floor(Math.random() * 2147483647);
}

io.on('connection', (socket) => {
    console.log(`[+] Игрок подключился: ${socket.id}`);
    socket.roomCode = null;

    // ─── Создание комнаты ──────────────────────────────────────────────
    socket.on('create_room', (deckData) => {
        const code = generateCode();
        const seed = generateSeed();
        rooms[code] = {
            players: [socket],
            seed: seed,
            hostDeck: deckData,   // колода хоста (Player 1)
            guestDeck: null
        };
        socket.roomCode = code;
        socket.join(code);
        socket.playerIndex = 0; // хост — игрок 0 (me)
        socket.emit('room_created', { code, seed });
        console.log(`[+] Комната создана: ${code}`);
    });

    // ─── Подключение к комнате ─────────────────────────────────────────
    socket.on('join_room', ({ code, deckData }) => {
        const room = rooms[code];
        if (!room) {
            socket.emit('room_error', 'Комната не найдена. Проверьте код.');
            return;
        }
        if (room.players.length >= 2) {
            socket.emit('room_error', 'Комната уже заполнена.');
            return;
        }
        room.players.push(socket);
        room.guestDeck = deckData; // колода гостя (Player 1 с их стороны)
        socket.roomCode = code;
        socket.join(code);
        socket.playerIndex = 1; // гость — игрок 1 (op с точки зрения хоста)

        // Оба игрока получают колоды друг друга и seed
        // Для каждого игрока "moDeck" — его колода, "opDeck" — колода противника
        const hostSocket = room.players[0];
        const guestSocket = room.players[1];

        hostSocket.emit('game_ready', {
            seed: room.seed,
            meDeck: room.hostDeck,
            opDeck: room.guestDeck,
            meIndex: 0
        });
        guestSocket.emit('game_ready', {
            seed: room.seed,
            meDeck: room.guestDeck,
            opDeck: room.hostDeck,
            meIndex: 1
        });
        console.log(`[+] Игра началась в комнате ${code}`);
    });

    // ─── Ретрансляция игровых действий ────────────────────────────────
    // Все события с префиксом 'action_' ретранслируются противнику
    // Формат: { type, payload }
    // Типы: PLAY_CARD, PLAY_DECOY, LEADER, PASS, MULLIGAN, CAROUSEL_SELECT, AGILE_ROW, SCOIA_CHOICE
    socket.on('game_action', (action) => {
        if (!socket.roomCode) return;
        // Отправляем противнику (всем в комнате кроме отправителя)
        socket.to(socket.roomCode).emit('opponent_action', action);
        console.log(`[>] Комната ${socket.roomCode}: ${action.type}`);
    });

    // ─── Переигровка / Новая игра ──────────────────────────────────────
    socket.on('request_rematch', () => {
        if (!socket.roomCode) return;
        socket.to(socket.roomCode).emit('rematch_requested');
    });

    socket.on('accept_rematch', () => {
        if (!socket.roomCode) return;
        const room = rooms[socket.roomCode];
        if (!room) return;
        const newSeed = generateSeed();
        room.seed = newSeed;
        io.to(socket.roomCode).emit('rematch_accepted', { seed: newSeed });
    });

    // ─── Отключение ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
        console.log(`[-] Игрок отключился: ${socket.id}`);
        const code = socket.roomCode;
        if (!code || !rooms[code]) return;
        // Уведомляем противника
        socket.to(code).emit('opponent_disconnected');
        // Удаляем комнату
        delete rooms[code];
        console.log(`[-] Комната ${code} закрыта`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  ГВИНТ Сервер запущен на порту ${PORT}`);
    console.log(`  Локальный адрес: http://localhost:${PORT}`);
    console.log(`========================================\n`);
});
