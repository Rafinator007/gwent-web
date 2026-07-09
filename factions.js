"use strict"

var factions = {
	realms: {
		get name() {
			return Settings.language.get() === "en" ? "Northern Realms" : "Королевства Севера";
		},
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount > 1 && game.roundHistory[game.roundCount-2].winner === player) {
				player.deck.draw(player.hand);
				await ui.notification("north", 1200);
			}
			return false;
		}),
		get description() {
			return Settings.language.get() === "en" 
				? "Draws an extra card from the deck when winning a round." 
				: "Берёт дополнительную карту из колоды при победе в раунде.";
		}
	},
	nilfgaard: {
		get name() {
			return Settings.language.get() === "en" ? "Nilfgaardian Empire" : "Империя Нильфгаард";
		},
		get description() {
			return Settings.language.get() === "en" 
				? "Wins any round that ends in a draw." 
				: "Побеждает в любом раунде, закончившемся вничью.";
		}
	},
	monsters: {
		get name() {
			return Settings.language.get() === "en" ? "Monsters" : "Чудовища";
		},
		factionAbility: player => game.roundEnd.push(() => {
			const isMe = player === player_me;
			const targetRows = isMe ? [3, 4, 5] : [2, 1, 0];
			const units = targetRows.map(idx => board.row[idx])
				.reduce((a,r) => r.cards.filter(c => c.isUnit()).concat(a), []);
			if (units.length === 0)
				return;
			const card = units[randomInt(units.length)];
			card.noRemove = true;
			game.roundStart.push( async () => {
				await ui.notification("monsters", 1200);
				delete card.noRemove;
				return true; 
			});
			return false;
		}),
		get description() {
			return Settings.language.get() === "en" 
				? "Keeps one random unit card on the battlefield after each round." 
				: "Оставляет одну случайную карту отряда на поле боя после каждого раунда.";
		}
	},
	scoiatael: {
		get name() {
			return Settings.language.get() === "en" ? "Scoia'tael" : "Скоя'таэли";
		},
		factionAbility: player => game.gameStart.push( async () => {
			let notif = "";
			if (player === player_me) {
				const title = Settings.language.get() === "en" ? "Who goes first?" : "Кто пойдет первым?";
				const desc = Settings.language.get() === "en" 
					? "Scoia'tael faction ability allows you to decide who makes the first move." 
					: "Умение фракции Скоя'таэлей позволяет вам решить, кто сделает первый ход в игре.";
				const optYes = Settings.language.get() === "en" ? "Go First" : "Ходить первым";
				const optNo = Settings.language.get() === "en" ? "Go Second" : "Ходить вторым";
				await ui.popup(optYes, () => game.firstPlayer = player, optNo, () => game.firstPlayer = player.opponent(), title, desc, 0.55);
				notif = game.firstPlayer.tag + "-first";
				if (isMultiplayer) {
					socket.emit('game_action', { type: 'SCOIA_CHOICE', goFirst: (game.firstPlayer === player_me) });
				}
			} else if (isMultiplayer) {
				let goFirst = await new Promise(resolve => {
					player_op.controller.pendingScoiaResolve = resolve;
				});
				game.firstPlayer = goFirst ? player_op : player_me;
				notif = game.firstPlayer.tag + "-first";
			} else if (player.hand instanceof HandAI) {
				if (Math.random() < 0.5) {
					game.firstPlayer = player;
					notif = "scoiatael";
				} else {
					game.firstPlayer = player.opponent();
					notif = game.firstPlayer.tag + "-first";
				}
			} else {
				//sleepUntil(game.firstPlayer); //TODO online
			}
			await ui.notification(notif,1200);
			return true;
		}),
		get description() {
			return Settings.language.get() === "en" 
				? "Decides who goes first at the start of the battle." 
				: "Решает, кто ходит первым в начале игры.";
		}
	},
	skellige: {
		get name() {
			return Settings.language.get() === "en" ? "Skellige" : "Скеллиге";
		},
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount != 3)
				return false;
			await ui.notification("skellige-" + player.tag, 1200);
			
			// Находим 2 случайных отряда (исключая героев и специальные/погодные карты) из сброса
			const units = player.grave.findCardsRandom(c => c.isUnit(), 2);
			if (units.length > 0) {
				// Выкладываем их на поле автоматически без интерактивного выбора ряда
				await Promise.all(units.map(c => board.toRow(c, player.grave)));
			}
			return true;
		}),
		get description() {
			return Settings.language.get() === "en" 
				? "2 random cards from the discard pile are returned to the battlefield at the start of round 3." 
				: "В начале третьего раунда возвращает 2 случайные карты из сброса на поле боя.";
		}
	}
}