CREATE TABLE `srs_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`easeFactor` float NOT NULL DEFAULT 2.5,
	`interval` int NOT NULL DEFAULT 1,
	`repetitions` int NOT NULL DEFAULT 0,
	`lapses` int NOT NULL DEFAULT 0,
	`dueDate` timestamp NOT NULL,
	`lastReviewedAt` timestamp,
	`totalReviews` int NOT NULL DEFAULT 0,
	`correctReviews` int NOT NULL DEFAULT 0,
	`state` enum('new','learning','review','relearning') NOT NULL DEFAULT 'new',
	`sourceResponseId` int,
	`lastScore` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `srs_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `srs_review_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardId` int NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`rating` int NOT NULL,
	`prevEaseFactor` float NOT NULL,
	`prevInterval` int NOT NULL,
	`prevRepetitions` int NOT NULL,
	`newEaseFactor` float NOT NULL,
	`newInterval` int NOT NULL,
	`newRepetitions` int NOT NULL,
	`responseText` text,
	`normalizedScore` float,
	`reviewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `srs_review_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `srs_cards` ADD CONSTRAINT `srs_cards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `srs_cards` ADD CONSTRAINT `srs_cards_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `srs_cards` ADD CONSTRAINT `srs_cards_sourceResponseId_userResponses_id_fk` FOREIGN KEY (`sourceResponseId`) REFERENCES `userResponses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `srs_review_logs` ADD CONSTRAINT `srs_review_logs_cardId_srs_cards_id_fk` FOREIGN KEY (`cardId`) REFERENCES `srs_cards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `srs_review_logs` ADD CONSTRAINT `srs_review_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `srs_review_logs` ADD CONSTRAINT `srs_review_logs_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;