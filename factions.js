"use strict"

var factions = {
	realms: {
		name: "Королевства Севера",
		factionAbility: player => game.roundStart.push( async () => {
			if (game.roundCount > 1 && game.roundHistory[game.roundCount-2].winner === player) {
				player.deck.draw(player.hand);
				await ui.notification("north", 1200);
			}
			return false;
		}),
		description: "Берёт дополнительную карту из колоды при победе в раунде."
	},
	nilfgaard: {
		name: "Империя Нильфгаард",
		description: "Побеждает в любом раунде, закончившемся вничью."
	},
	monsters: {
		name: "Чудовища",
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
		description: "Оставляет одну случайную карту отряда на поле боя после каждого раунда."
	},
	scoiatael: {
		name: "Скоя'таэли",
		factionAbility: player => game.gameStart.push( async () => {
			let notif = "";
			if (player === player_me) {
				await ui.popup("Ходить первым", () => game.firstPlayer = player, "Ходить вторым", () => game.firstPlayer = player.opponent(), "Кто пойдет первым?", "Умение фракции Скоя'таэлей позволяет вам решить, кто сделает первый ход в игре.", 0.55);
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
		description: "Решает, кто ходит первым в начале игры."
	},
	skellige: {
		name: "Скеллиге",
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
		description: "В начале третьего раунда возвращает 2 случайные карты из сброса на поле боя."
	}
}