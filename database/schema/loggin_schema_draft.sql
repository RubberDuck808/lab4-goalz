CREATE TABLE "Quizzes"("id" BIGINT NOT NULL);
ALTER TABLE
    "Quizzes" ADD PRIMARY KEY("id");
CREATE TABLE "Answers"(
    "id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "answer_txt" VARCHAR(255) NOT NULL,
    "is_correct" BOOLEAN NOT NULL
);
ALTER TABLE
    "Answers" ADD PRIMARY KEY("id");
CREATE TABLE "Questions"(
    "id" BIGINT NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "question_txt" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Questions" ADD PRIMARY KEY("id");
CREATE TABLE "Parties"(
    "id" BIGINT NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" BIGINT NOT NULL
);
ALTER TABLE
    "Parties" ADD PRIMARY KEY("id");
CREATE TABLE "Party_members"(
    "id" BIGINT NOT NULL,
    "party_group_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL
);
ALTER TABLE
    "Party_members" ADD PRIMARY KEY("id");
CREATE TABLE "Party_groups"(
    "id" BIGINT NOT NULL,
    "party_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Party_groups" ADD PRIMARY KEY("id");
CREATE TABLE "Users"(
    "id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Users" ADD PRIMARY KEY("id");
CREATE TABLE "Party_group_answers"(
    "id" BIGINT NOT NULL,
    "party_group_id" BIGINT NOT NULL,
    "answer_id" BIGINT NOT NULL,
    "received_points" BIGINT NOT NULL
);
ALTER TABLE
    "Party_group_answers" ADD PRIMARY KEY("id");
CREATE TABLE "Information"(
    "id" BIGINT NOT NULL,
    "info_txt" BIGINT NOT NULL,
    "new_column" BIGINT NOT NULL
);
ALTER TABLE
    "Information" ADD PRIMARY KEY("id");
ALTER TABLE
    "Party_members" ADD CONSTRAINT "party_members_party_group_id_foreign" FOREIGN KEY("party_group_id") REFERENCES "Party_groups"("id");
ALTER TABLE
    "Party_groups" ADD CONSTRAINT "party_groups_party_id_foreign" FOREIGN KEY("party_id") REFERENCES "Parties"("id");
ALTER TABLE
    "Party_members" ADD CONSTRAINT "party_members_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Party_group_answers" ADD CONSTRAINT "party_group_answers_party_group_id_foreign" FOREIGN KEY("party_group_id") REFERENCES "Party_groups"("id");
ALTER TABLE
    "Questions" ADD CONSTRAINT "questions_quiz_id_foreign" FOREIGN KEY("quiz_id") REFERENCES "Quizzes"("id");
ALTER TABLE
    "Parties" ADD CONSTRAINT "parties_name_foreign" FOREIGN KEY("name") REFERENCES "Quizzes"("id");
ALTER TABLE
    "Answers" ADD CONSTRAINT "answers_question_id_foreign" FOREIGN KEY("question_id") REFERENCES "Questions"("id");
ALTER TABLE
    "Party_group_answers" ADD CONSTRAINT "party_group_answers_answer_id_foreign" FOREIGN KEY("answer_id") REFERENCES "Answers"("id");