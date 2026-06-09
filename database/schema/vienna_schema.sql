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
CREATE TABLE public.Boundaries (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Name text NOT NULL,
  Color text NOT NULL,
  Geometry USER-DEFINED NOT NULL,
  CONSTRAINT Boundaries_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.Checkpoints (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ReferenceId bigint NOT NULL,
  Type text NOT NULL,
  Location USER-DEFINED NOT NULL,
  ZoneId bigint,
  CONSTRAINT Checkpoints_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_Checkpoints_Zones_ZoneId FOREIGN KEY (ZoneId) REFERENCES public.Zones(Id)
);
CREATE TABLE public.ElementType (
  Id integer NOT NULL,
  Name text NOT NULL,
  CONSTRAINT ElementType_pkey PRIMARY KEY (Id)
);
CREATE TABLE public.Elements (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  ElementName text NOT NULL,
  ElementTypeId bigint NOT NULL,
  Geom USER-DEFINED NOT NULL,
  ImageUrl text NOT NULL,
  IsGreen boolean NOT NULL,
  CONSTRAINT Elements_pkey PRIMARY KEY (Id),
  CONSTRAINT fk_elements_elementtype FOREIGN KEY (ElementTypeId) REFERENCES public.ElementType(Id)
);
CREATE TABLE public.Friendships (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  RequesterId bigint NOT NULL,
  AddresseeId bigint NOT NULL,
  Status text NOT NULL,
  CreatedAt timestamp with time zone NOT NULL,
  UpdatedAt timestamp with time zone,
  CONSTRAINT Friendships_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_Friendships_Users_AddresseeId FOREIGN KEY (AddresseeId) REFERENCES public.Users(Id),
  CONSTRAINT FK_Friendships_Users_RequesterId FOREIGN KEY (RequesterId) REFERENCES public.Users(Id)
);
CREATE TABLE public.Parties (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  QuizId bigint,
  Name text NOT NULL,
  Code bigint NOT NULL,
  Status text NOT NULL DEFAULT ''::text,
  CreatedAt timestamp with time zone NOT NULL DEFAULT now(),
  CheckpointsPerZone integer,
  GroupSize integer,
  ZoneCount integer,
  BoundaryId bigint,
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
  Role text,
  PartyId bigint NOT NULL DEFAULT 0,
  CONSTRAINT PartyMembers_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_PartyMembers_PartyGroups_PartyGroupId FOREIGN KEY (PartyGroupId) REFERENCES public.PartyGroups(Id),
  CONSTRAINT FK_PartyMembers_Users_UserId FOREIGN KEY (UserId) REFERENCES public.Users(Id)
);
CREATE TABLE public.PartyVisitedCheckpoints (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  PartyId bigint NOT NULL,
  CheckpointId bigint NOT NULL,
  CONSTRAINT PartyVisitedCheckpoints_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_PartyVisitedCheckpoints_Checkpoints_CheckpointId FOREIGN KEY (CheckpointId) REFERENCES public.Checkpoints(Id),
  CONSTRAINT FK_PartyVisitedCheckpoints_Parties_PartyId FOREIGN KEY (PartyId) REFERENCES public.Parties(Id)
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
CREATE TABLE public.SensorData (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  SensorsId bigint,
  Light bigint,
  Humidity bigint,
  Temp double precision,
  Timestamp timestamp without time zone NOT NULL,
  CONSTRAINT SensorData_pkey PRIMARY KEY (id),
  CONSTRAINT fk_sensordata_sensors FOREIGN KEY (SensorsId) REFERENCES public.Sensors(Id)
);
CREATE TABLE public.Sensors (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  SensorName text,
  Geom USER-DEFINED,
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
CREATE TABLE public.Zones (
  Id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  Name text NOT NULL,
  Color text NOT NULL,
  Boundary USER-DEFINED NOT NULL,
  BoundaryId bigint,
  CONSTRAINT Zones_pkey PRIMARY KEY (Id),
  CONSTRAINT FK_Zones_Boundaries_BoundaryId FOREIGN KEY (BoundaryId) REFERENCES public.Boundaries(Id)
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