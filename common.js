"use strict"

Array.prototype.remove = function(elem)
{
	const index = this.indexOf(elem);
	if (index !== -1)
		this.splice(index, 1);
}

function isEmpty(obj)
{
	for (const property in obj)
	{
		if (Object.hasOwn(obj, property))
			return false;
	}
	return true;
}

class RGBA
{
	constructor(r, g, b, a = 1)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	setAlpha(a)
	{
		this.a = a;
	}
	toString()
	{
		const hasAlpha = this.a < 1;
		return (hasAlpha ? "rgba(" : "rgb(") 
		+ this.r + ',' + this.g + ',' + this.b
		+ (hasAlpha ? "," + this.a : "")
		+ ")";
	}
}

// returns val or the min/max it is closest to. Flips inverted min/max values.
function clamp(min, max, val)
{
	if (min > max)
		return clamp(max, min, val);
	return Math.min(max, Math.max(min, val));
}

// Returns the linear interpolation of t from a to b (unclamped)
function lerp(a, b, t)
{
	return (1-t)*a + t*b;
}

// Returns the normalized value of t from the range [a,b]
function inverseLerp(a, b, t)
{
	return (t - a) / (b - a);
}

// Returns the lerp() of [y,z] using the normalized value of t in [a,b] as the param
function map(a, b, y, z, t)
{
	return lerp(y, z, inverseLerp(a, b, t));
}


// Returns true if n is an Number
function isNumber(n) { 
	return !isNaN(parseFloat(n)) && isFinite(n);
}

// Returns true if s is a String
function isString(s){
	return typeof(s) === 'string' || s instanceof String;
}

// Interprets passed string as an interger. Empty strings return 0, null string return NaN
function toInteger(str)
{
	if (str === '')
		return 0;
	else if (!str)
		return NaN;
	return Number.parseInt(str);
}

// Returns a random integer in the range [0,n)
function randomInt(n)  {
	return Math.floor(Math.random() * n);
}

const TRANSLATIONS = {
	ru: {
		"title": { text: "Гвинт: классическая версия из «Ведьмак 3: Дикая Охота»" },
		"#exit-game": { title: "Выйти из игры" },
		"#leader-op .leader-container": { title: "Посмотреть карту лидера" },
		"#name-op": { text: "Соперник" },
		"#passed-op": { text: "Пас" },
		"#passed-me": { text: "Пас" },
		"#leader-me .leader-container": { title: "Сыграть карту лидера" },
		"#pass-button": { text: "Пас", title: "Пасовать раунд" },
		"#grave-op": { title: "Просмотреть сброс" },
		"#grave-me": { title: "Просмотреть сброс" },
		"#upload-deck": { text: "Загрузить колоду" },
		"#change-faction": { text: "Сменить фракцию" },
		"#download-deck": { text: "Скачать колоду" },
		"#card-bank-title": { text: "Коллекция карт" },
		"#card-deck-title": { text: "Карты в колоде" },
		"#card-leader p": { text: "Лидер" },
		"#start-game": { text: "Против ПК" },
		"#start-multiplayer": { text: "Против друга" },
		"#opponent-preview p": { text: "Колода соперника" },
		"#op-preview-open": { title: "Просмотреть колоду соперника" },
		"#op-preview-leader": { title: "Выбрать лидера/фракцию соперника" },
		"#op-preview-clear": { title: "Сбросить колоду соперника" },
		"#op-preview-upload": { text: "Импорт", title: "Загрузить колоду соперника" },
		"#lobby-title": { text: "Сетевая комната" },
		"#lobby-status": { text: "Выберите действие ниже" },
		"#btn-create-room": { text: "Создать комнату" },
		".or-separator": { text: "- ИЛИ -" },
		"#room-code-input": { placeholder: "Код" },
		"#btn-join-room": { text: "Войти в комнату" },
		"#lobby-waiting-text": { text: "Поделитесь кодом комнаты с другом:" },
		"#lobby-waiting-status": { text: "Ожидание подключения соперника..." },
		"#btn-cancel-lobby": { text: "Отмена" },
		"#toggle-music": { title: "Вкл/Выкл музыку" },
		"#toggle-sfx": { title: "Вкл/Выкл звуки" },
		"#toggle-notifications": { title: "Вкл/Выкл уведомления" },
		"#toggle-lang": { title: "Сменить язык / Switch Language" },
		"#deck-stats > p:nth-child(1)": { text: "Всего карт в колоде" },
		"#deck-stats > p:nth-child(3)": { text: "Количество карт отрядов" },
		"#deck-stats > p:nth-child(5)": { text: "Специальные карты" },
		"#deck-stats > p:nth-child(7)": { text: "Общая сила карт отрядов" },
		"#deck-stats > p:nth-child(9)": { text: "Карты-герои" },
		"#deck-stats > p:nth-child(11)": { text: "Шпионы" },
		"#deck-stats > p:nth-child(13)": { text: "Медики" },
		"#toggle-vs-pc": { text: "Против ПК" },
		"#toggle-vs-friend": { text: "Против друга" },
		"#start-match": { text: "Играть" },
		"#toggle-tournament": { text: "Режим: Классический" }
	},
	en: {
		"title": { text: "Gwent: Classic Edition from The Witcher 3: Wild Hunt" },
		"#exit-game": { title: "Exit game" },
		"#leader-op .leader-container": { title: "View opponent's leader card" },
		"#name-op": { text: "Opponent" },
		"#passed-op": { text: "Passed" },
		"#passed-me": { text: "Passed" },
		"#leader-me .leader-container": { title: "Play leader card" },
		"#pass-button": { text: "Pass", title: "Pass round" },
		"#grave-op": { title: "View discard pile" },
		"#grave-me": { title: "View discard pile" },
		"#upload-deck": { text: "Import Deck" },
		"#change-faction": { text: "Change Faction" },
		"#download-deck": { text: "Export Deck" },
		"#card-bank-title": { text: "Card Collection" },
		"#card-deck-title": { text: "Cards in Deck" },
		"#card-leader p": { text: "Leader" },
		"#deck-stats > p:nth-child(1)": { text: "Total cards in deck" },
		"#deck-stats > p:nth-child(3)": { text: "Number of unit cards" },
		"#deck-stats > p:nth-child(5)": { text: "Special cards" },
		"#deck-stats > p:nth-child(7)": { text: "Total strength of unit cards" },
		"#deck-stats > p:nth-child(9)": { text: "Hero cards" },
		"#deck-stats > p:nth-child(11)": { text: "Spies" },
		"#deck-stats > p:nth-child(13)": { text: "Medics" },
		"#toggle-vs-pc": { text: "vs CPU" },
		"#toggle-vs-friend": { text: "vs Friend" },
		"#start-match": { text: "Play" },
		"#toggle-tournament": { text: "Mode: Classic" },
		"#opponent-preview p": { text: "Opponent's Deck" },
		"#op-preview-open": { title: "View opponent's deck" },
		"#op-preview-leader": { title: "Choose opponent's leader/faction" },
		"#op-preview-clear": { title: "Clear opponent's deck" },
		"#op-preview-upload": { text: "Import", title: "Import opponent's deck" },
		"#lobby-title": { text: "Multiplayer Lobby" },
		"#lobby-status": { text: "Select action below" },
		"#btn-create-room": { text: "Create Room" },
		".or-separator": { text: "- OR -" },
		"#room-code-input": { placeholder: "Code" },
		"#btn-join-room": { text: "Join Room" },
		"#lobby-waiting-text": { text: "Share this room code with a friend:" },
		"#lobby-waiting-status": { text: "Waiting for opponent to connect..." },
		"#btn-cancel-lobby": { text: "Cancel" },
		"#toggle-music": { title: "Toggle Music" },
		"#toggle-sfx": { title: "Toggle Sounds" },
		"#toggle-notifications": { title: "Toggle Notifications" },
		"#toggle-lang": { title: "Сменить язык / Switch Language" }
	}
};
