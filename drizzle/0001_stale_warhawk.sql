CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`milestoneType` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	`isNotified` boolean DEFAULT false,
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practice_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` enum('mock_test','section_practice','diagnostic','revision','beginner') NOT NULL,
	`section` enum('speaking','writing','reading','listening','full') NOT NULL,
	`mode` enum('beginner','exam','diagnostic','revision') NOT NULL DEFAULT 'exam',
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`totalQuestions` int DEFAULT 0,
	`answeredQuestions` int DEFAULT 0,
	`overallScore` float,
	`speakingScore` float,
	`writingScore` float,
	`readingScore` float,
	`listeningScore` float,
	`grammarScore` float,
	`oralFluencyScore` float,
	`pronunciationScore` float,
	`spellingScore` float,
	`vocabularyScore` float,
	`writtenDiscourseScore` float,
	`weakSkills` json,
	`strongSkills` json,
	`actionPlan` text,
	CONSTRAINT `practice_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practiceTargets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetDate` timestamp NOT NULL,
	`targetMinutes` int DEFAULT 30,
	`focusSkills` json,
	`recommendedTasks` json,
	`completedMinutes` int DEFAULT 0,
	`isCompleted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practiceTargets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`section` enum('speaking','writing','reading','listening') NOT NULL,
	`taskType` varchar(64) NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`prompt` text,
	`content` text,
	`audioUrl` text,
	`imageUrl` text,
	`options` json,
	`correctAnswer` text,
	`modelAnswer` text,
	`wordLimit` int,
	`timeLimit` int,
	`preparationTime` int,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`responseText` text,
	`audioUrl` text,
	`transcription` text,
	`selectedOptions` json,
	`timeTaken` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`contentScore` float,
	`formScore` float,
	`languageScore` float,
	`pronunciationScore` float,
	`fluencyScore` float,
	`totalScore` float,
	`normalizedScore` float,
	`feedback` text,
	`strengths` json,
	`improvements` json,
	`grammarErrors` json,
	`vocabularyFeedback` text,
	`pronunciationFeedback` text,
	`fluencyFeedback` text,
	`isCorrect` boolean,
	CONSTRAINT `userResponses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `targetScore` int DEFAULT 65;--> statement-breakpoint
ALTER TABLE `users` ADD `currentLevel` enum('beginner','intermediate','advanced') DEFAULT 'intermediate';--> statement-breakpoint
ALTER TABLE `users` ADD `dailyGoalMinutes` int DEFAULT 30;--> statement-breakpoint
ALTER TABLE `users` ADD `notificationsEnabled` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `practice_sessions` ADD CONSTRAINT `practice_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `practiceTargets` ADD CONSTRAINT `practiceTargets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userResponses` ADD CONSTRAINT `userResponses_sessionId_practice_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `practice_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userResponses` ADD CONSTRAINT `userResponses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userResponses` ADD CONSTRAINT `userResponses_questionId_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE no action ON UPDATE no action;