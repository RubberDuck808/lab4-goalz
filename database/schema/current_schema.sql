-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Answers (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  QuestionId bigint NOT NULL,
  AnswerTxt text NOT NULL,
  IsCorrect boolean NOT NULL,
  CONSTRAINT Answers_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_Answers_Questions_QuestionId FOREIGN KEY (QuestionId) REFERENCES public.Questions(Id)
);
CREATE TABLE public.Elements (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ElementName bigint NOT NULL,
  ElementType bigint NOT NULL,
  Geom USER-DEFINED NOT NULL,
  ImageUrl text NOT NULL,
  IsGreen boolean NOT NULL,
  CONSTRAINT Elements_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.Parties (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  QuizId bigint NOT NULL,
  Name text NOT NULL,
  Code bigint NOT NULL,
  CONSTRAINT Parties_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_Parties_Quizzes_QuizId FOREIGN KEY (QuizId) REFERENCES public.Quizzes(Id)
);
CREATE TABLE public.PartyGroupAnswers (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  PartyGroupId bigint NOT NULL,
  AnswerId bigint NOT NULL,
  ReceivedPoints bigint NOT NULL,
  CONSTRAINT PartyGroupAnswers_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_PartyGroupAnswers_Answers_AnswerId FOREIGN KEY (AnswerId) REFERENCES public.Answers(Id),
  CONSTRAINT FK_PartyGroupAnswers_PartyGroups_PartyGroupId FOREIGN KEY (PartyGroupId) REFERENCES public.PartyGroups(Id)
);
CREATE TABLE public.PartyGroups (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  PartyId bigint NOT NULL,
  Name text NOT NULL,
  CONSTRAINT PartyGroups_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_PartyGroups_Parties_PartyId FOREIGN KEY (PartyId) REFERENCES public.Parties(Id)
);
CREATE TABLE public.PartyMembers (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  PartyGroupId bigint NOT NULL,
  UserId bigint NOT NULL,
  CONSTRAINT PartyMembers_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_PartyMembers_PartyGroups_PartyGroupId FOREIGN KEY (PartyGroupId) REFERENCES public.PartyGroups(Id),
  CONSTRAINT FK_PartyMembers_Users_UserId FOREIGN KEY (UserId) REFERENCES public.Users(Id)
);
CREATE TABLE public.Questions (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  QuizId bigint NOT NULL,
  QuestionTxt text NOT NULL,
  CONSTRAINT Questions_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_Questions_Quizzes_QuizId FOREIGN KEY (QuizId) REFERENCES public.Quizzes(Id)
);
CREATE TABLE public.Quizzes (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT Quizzes_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.Sensors (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Temp bigint NOT NULL,
  Humidity bigint NOT NULL,
  Geo USER-DEFINED NOT NULL,
  CONSTRAINT Sensors_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.Users (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Name text NOT NULL,
  PasswordHash text NOT NULL,
  Role text NOT NULL DEFAULT 0,
  Email text NOT NULL DEFAULT ''::text,
  Username text NOT NULL DEFAULT ''::text,
  CreatedAt timestamp with time zone NOT NULL DEFAULT '-infinity'::timestamp with time zone,
  CONSTRAINT Users_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.__EFMigrationsHistory (
  MigrationId character varying NOT NULL,
  ProductVersion character varying NOT NULL,
  CONSTRAINT __EFMigrationsHistory_pkey PRIMARY KEY (MigrationId)
);
CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);