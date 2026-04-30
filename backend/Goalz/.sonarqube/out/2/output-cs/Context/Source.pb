ﬁT
l/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260415105321_InitialCreate.csÿSusing Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Tables already exist ‚Äî created by Goalz.Infrastructure migrations.
        }

        private void _OriginalUp(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Quiz",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quiz", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Party",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuizId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Party", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Party_Quiz_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quiz",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Question",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuizId = table.Column<long>(type: "bigint", nullable: false),
                    QuestionTxt = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Question", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Question_Quiz_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quiz",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PartyGroup",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartyId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyGroup", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartyGroup_Party_PartyId",
                        column: x => x.PartyId,
                        principalTable: "Party",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Answer",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionId = table.Column<long>(type: "bigint", nullable: false),
                    AnswerTxt = table.Column<string>(type: "text", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Answer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Answer_Question_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "Question",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PartyMember",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartyGroupId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyMember", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartyMember_PartyGroup_PartyGroupId",
                        column: x => x.PartyGroupId,
                        principalTable: "PartyGroup",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PartyMember_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PartyGroupAnswer",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartyGroupId = table.Column<long>(type: "bigint", nullable: false),
                    AnswerId = table.Column<long>(type: "bigint", nullable: false),
                    ReceivedPoints = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyGroupAnswer", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartyGroupAnswer_Answer_AnswerId",
                        column: x => x.AnswerId,
                        principalTable: "Answer",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PartyGroupAnswer_PartyGroup_PartyGroupId",
                        column: x => x.PartyGroupId,
                        principalTable: "PartyGroup",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Answer_QuestionId",
                table: "Answer",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_Party_QuizId",
                table: "Party",
                column: "QuizId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyGroup_PartyId",
                table: "PartyGroup",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyGroupAnswer_AnswerId",
                table: "PartyGroupAnswer",
                column: "AnswerId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyGroupAnswer_PartyGroupId",
                table: "PartyGroupAnswer",
                column: "PartyGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyMember_PartyGroupId",
                table: "PartyMember",
                column: "PartyGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyMember_UserId",
                table: "PartyMember",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Question_QuizId",
                table: "Question",
                column: "QuizId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PartyGroupAnswer");

            migrationBuilder.DropTable(
                name: "PartyMember");

            migrationBuilder.DropTable(
                name: "Answer");

            migrationBuilder.DropTable(
                name: "PartyGroup");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Question");

            migrationBuilder.DropTable(
                name: "Party");

            migrationBuilder.DropTable(
                name: "Quiz");
        }
    }
}
ParseOptions.0.json‹Y
u/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260415105321_InitialCreate.Designer.csÕX// <auto-generated />
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260415105321_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMember");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json÷
o/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260415105504_AddUserCreatedAt.csÕusing System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");
        }
    }
}
ParseOptions.0.jsonÓZ
x/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260415105504_AddUserCreatedAt.Designer.cs‹Y// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260415105504_AddUserCreatedAt")]
    partial class AddUserCreatedAt
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMember");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonü
m/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260415111426_AddFriendships.csòusing System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFriendships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Friendships",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RequesterId = table.Column<long>(type: "bigint", nullable: false),
                    AddresseeId = table.Column<long>(type: "bigint", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Friendships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Friendships_Users_AddresseeId",
                        column: x => x.AddresseeId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Friendships_Users_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_AddresseeId",
                table: "Friendships",
                column: "AddresseeId");

            migrationBuilder.CreateIndex(
                name: "IX_Friendships_RequesterId_AddresseeId",
                table: "Friendships",
                columns: new[] { "RequesterId", "AddresseeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Friendships");
        }
    }
}
ParseOptions.0.jsonÓj
v/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260415111426_AddFriendships.Designer.csﬁi// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260415111426_AddFriendships")]
    partial class AddFriendships
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMember");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json»
g/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260420112432_AddZones.cs«using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddZones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Zones",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ZoneType = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Boundary = table.Column<Geometry>(type: "geometry", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Zones", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Zones_Boundary",
                table: "Zones",
                column: "Boundary")
                .Annotation("Npgsql:IndexMethod", "gist");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Zones_Boundary",
                table: "Zones");

            migrationBuilder.DropTable(
                name: "Zones");
        }
    }
}
ParseOptions.0.json—Ç
p/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260420112432_AddZones.Designer.cs∆Å// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260420112432_AddZones")]
    partial class AddZones
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("ElementName")
                        .HasColumnType("bigint");

                    b.Property<long>("ElementType")
                        .HasColumnType("bigint");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMember");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("Boundary")
                        .HasDatabaseName("IX_Zones_Boundary")
                        .HasAnnotation("Npgsql:IndexMethod", "gist");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonÃ
j/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260422183016_AddSections.cs»using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sections",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ZoneId = table.Column<long>(type: "bigint", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    CompletionCriteria = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sections_Zones_ZoneId",
                        column: x => x.ZoneId,
                        principalTable: "Zones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sections_OrderIndex",
                table: "Sections",
                column: "OrderIndex",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sections_ZoneId",
                table: "Sections",
                column: "ZoneId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sections");
        }
    }
}
ParseOptions.0.jsonåå
s/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260422183016_AddSections.Designer.cs˛ä// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260422183016_AddSections")]
    partial class AddSections
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("ElementName")
                        .HasColumnType("bigint");

                    b.Property<long>("ElementType")
                        .HasColumnType("bigint");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMember");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonß
m/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260423080000_AddCheckpoints.cs†using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    public partial class AddCheckpoints : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Checkpoints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SectionId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<Point>(type: "geometry", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Checkpoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Checkpoints_Sections_SectionId",
                        column: x => x.SectionId,
                        principalTable: "Sections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_SectionId",
                table: "Checkpoints",
                column: "SectionId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Checkpoints");
        }
    }
}
ParseOptions.0.jsonıô
v/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260423080000_AddCheckpoints.Designer.cs‰ò// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260423080000_AddCheckpoints")]
    partial class AddCheckpoints
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("SectionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("SectionId");

                    b.ToTable("Checkpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("ElementName")
                        .HasColumnType("bigint");

                    b.Property<long>("ElementType")
                        .HasColumnType("bigint");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.ToTable("Elements", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Party", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroup", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMember", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Section", "Section")
                        .WithMany("Checkpoints")
                        .HasForeignKey("SectionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Section");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Navigation("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json›
v/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260425110916_AlterCheckpointRedesign.csÕusing Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AlterCheckpointRedesign : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Checkpoints_Sections_SectionId",
                table: "Checkpoints");

            migrationBuilder.DropIndex(
                name: "IX_Checkpoints_SectionId",
                table: "Checkpoints");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Checkpoints");

            migrationBuilder.RenameColumn(
                name: "SectionId",
                table: "Checkpoints",
                newName: "ReferenceId");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Checkpoints",
                newName: "Type");

            migrationBuilder.AddColumn<long>(
                name: "ZoneId",
                table: "Checkpoints",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_Type_ReferenceId",
                table: "Checkpoints",
                columns: new[] { "Type", "ReferenceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_ZoneId",
                table: "Checkpoints",
                column: "ZoneId");

            migrationBuilder.AddForeignKey(
                name: "FK_Checkpoints_Zones_ZoneId",
                table: "Checkpoints",
                column: "ZoneId",
                principalTable: "Zones",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Checkpoints_Zones_ZoneId",
                table: "Checkpoints");

            migrationBuilder.DropIndex(
                name: "IX_Checkpoints_Type_ReferenceId",
                table: "Checkpoints");

            migrationBuilder.DropIndex(
                name: "IX_Checkpoints_ZoneId",
                table: "Checkpoints");

            migrationBuilder.DropColumn(
                name: "ZoneId",
                table: "Checkpoints");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Checkpoints",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "ReferenceId",
                table: "Checkpoints",
                newName: "SectionId");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Checkpoints",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Checkpoints_SectionId",
                table: "Checkpoints",
                column: "SectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Checkpoints_Sections_SectionId",
                table: "Checkpoints",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
ParseOptions.0.json¡£
/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260425110916_AlterCheckpointRedesign.Designer.csß¢// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260425110916_AlterCheckpointRedesign")]
    partial class AlterCheckpointRedesign
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long?>("Light")
                        .HasColumnType("bigint");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json˛
o/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260426205518_AddGamePlayState.csıusing Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGamePlayState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "PartyMembers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Parties",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PartyVisitedCheckpoints",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PartyId = table.Column<long>(type: "bigint", nullable: false),
                    CheckpointId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyVisitedCheckpoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartyVisitedCheckpoints_Checkpoints_CheckpointId",
                        column: x => x.CheckpointId,
                        principalTable: "Checkpoints",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PartyVisitedCheckpoints_Parties_PartyId",
                        column: x => x.PartyId,
                        principalTable: "Parties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PartyVisitedCheckpoints_CheckpointId",
                table: "PartyVisitedCheckpoints",
                column: "CheckpointId");

            migrationBuilder.CreateIndex(
                name: "IX_PartyVisitedCheckpoints_PartyId",
                table: "PartyVisitedCheckpoints",
                column: "PartyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PartyVisitedCheckpoints");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "PartyMembers");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Parties");
        }
    }
}
ParseOptions.0.json¸∞
x/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260426205518_AddGamePlayState.Designer.csÈØ// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260426205518_AddGamePlayState")]
    partial class AddGamePlayState
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long?>("Light")
                        .HasColumnType("bigint");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json∂
v/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260426214146_MakePartyQuizIdNullable.cs¶using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class MakePartyQuizIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parties_Quizzes_QuizId",
                table: "Parties");

            migrationBuilder.AlterColumn<long>(
                name: "QuizId",
                table: "Parties",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_Parties_Quizzes_QuizId",
                table: "Parties",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Parties_Quizzes_QuizId",
                table: "Parties");

            migrationBuilder.AlterColumn<long>(
                name: "QuizId",
                table: "Parties",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Parties_Quizzes_QuizId",
                table: "Parties",
                column: "QuizId",
                principalTable: "Quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
ParseOptions.0.json≤∞
/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260426214146_MakePartyQuizIdNullable.Designer.csòØ// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260426214146_MakePartyQuizIdNullable")]
    partial class MakePartyQuizIdNullable
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long?>("Light")
                        .HasColumnType("bigint");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId");

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonç
t/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427000001_AddPartyMemberPartyId.csˇusing Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPartyMemberPartyId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "PartyId",
                table: "PartyMembers",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PartyId",
                table: "PartyMembers");
        }
    }
}
ParseOptions.0.json¨∞
}/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427000001_AddPartyMemberPartyId.Designer.csîØ// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260427000001_AddPartyMemberPartyId")]
    partial class AddPartyMemberPartyId
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long?>("Light")
                        .HasColumnType("bigint");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.Property<long>("Temp")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId");

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json€

y/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427151538_FixSensorDataCascadeDelete.cs»	using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixSensorDataCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""SensorData""
                    DROP CONSTRAINT IF EXISTS ""fk_sensordata_sensors"";

                ALTER TABLE ""SensorData""
                    ADD CONSTRAINT ""fk_sensordata_sensors""
                    FOREIGN KEY (""SensorsId"")
                    REFERENCES ""Sensors""(""Id"")
                    ON DELETE CASCADE;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE ""SensorData""
                    DROP CONSTRAINT IF EXISTS ""fk_sensordata_sensors"";

                ALTER TABLE ""SensorData""
                    ADD CONSTRAINT ""fk_sensordata_sensors""
                    FOREIGN KEY (""SensorsId"")
                    REFERENCES ""Sensors""(""Id"");
            ");
        }
    }
}
ParseOptions.0.json‡π
Ç/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427151538_FixSensorDataCascadeDelete.Designer.cs¬∏// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260427151538_FixSensorDataCascadeDelete")]
    partial class FixSensorDataCascadeDelete
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .HasColumnType("geometry")
                        .HasColumnName("Geom");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Light")
                        .HasColumnType("bigint");

                    b.Property<long>("SensorsId")
                        .HasColumnType("bigint");

                    b.Property<double>("Temp")
                        .HasColumnType("double precision");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("SensorsId");

                    b.ToTable("SensorData");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId");

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Sensor", "Sensor")
                        .WithMany()
                        .HasForeignKey("SensorsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Sensor");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.json´
p/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427162225_AddPartyCreatedAt.cs°using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPartyCreatedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Parties",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Parties");
        }
    }
}
ParseOptions.0.jsonø∫
y/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427162225_AddPartyCreatedAt.Designer.cs´π// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260427162225_AddPartyCreatedAt")]
    partial class AddPartyCreatedAt
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .HasColumnType("geometry")
                        .HasColumnName("Geom");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Light")
                        .HasColumnType("bigint");

                    b.Property<long>("SensorsId")
                        .HasColumnType("bigint");

                    b.Property<double>("Temp")
                        .HasColumnType("double precision");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("SensorsId");

                    b.ToTable("SensorData");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId");

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Sensor", "Sensor")
                        .WithMany()
                        .HasForeignKey("SensorsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Sensor");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonÈ
q/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427163224_AddPartyGameConfig.csﬁusing Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPartyGameConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BoundaryZoneId",
                table: "Parties",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CheckpointsPerZone",
                table: "Parties",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GroupSize",
                table: "Parties",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ZoneCount",
                table: "Parties",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BoundaryZoneId",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "CheckpointsPerZone",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "GroupSize",
                table: "Parties");

            migrationBuilder.DropColumn(
                name: "ZoneCount",
                table: "Parties");
        }
    }
}
ParseOptions.0.jsonËΩ
z/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427163224_AddPartyGameConfig.Designer.cs”º// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260427163224_AddPartyGameConfig")]
    partial class AddPartyGameConfig
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long?>("BoundaryZoneId")
                        .HasColumnType("bigint");

                    b.Property<int?>("CheckpointsPerZone")
                        .HasColumnType("integer");

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int?>("GroupSize")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("ZoneCount")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("CompletionCriteria")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("OrderIndex")
                        .HasColumnType("integer");

                    b.Property<long>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("OrderIndex")
                        .IsUnique();

                    b.HasIndex("ZoneId")
                        .IsUnique();

                    b.ToTable("Sections");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .HasColumnType("geometry")
                        .HasColumnName("Geom");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Light")
                        .HasColumnType("bigint");

                    b.Property<long>("SensorsId")
                        .HasColumnType("bigint");

                    b.Property<double>("Temp")
                        .HasColumnType("double precision");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("SensorsId");

                    b.ToTable("SensorData");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ZoneType")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId");

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Section", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithOne()
                        .HasForeignKey("Goalz.Domain.Entities.Section", "ZoneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Sensor", "Sensor")
                        .WithMany()
                        .HasForeignKey("SensorsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Sensor");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonÿ)
w/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427200000_SeparateBoundaryFromZone.cs«(using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(Goalz.Data.Storage.AppDbContext))]
    [Migration("20260427200000_SeparateBoundaryFromZone")]
    public partial class SeparateBoundaryFromZone : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Create Boundaries table
            migrationBuilder.CreateTable(
                name: "Boundaries",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Geometry = table.Column<Geometry>(type: "geometry", nullable: false),
                },
                constraints: table => table.PrimaryKey("PK_Boundaries", x => x.Id));

            migrationBuilder.CreateIndex(
                name: "IX_Boundaries_Geometry",
                table: "Boundaries",
                column: "Geometry")
                .Annotation("Npgsql:IndexMethod", "gist");

            // 2. Copy existing boundary zones into Boundaries (preserving IDs)
            migrationBuilder.Sql("""
                INSERT INTO "Boundaries" ("Id", "Name", "Color", "Geometry")
                SELECT "Id", "Name", "Color", "Boundary"
                FROM "Zones"
                WHERE "ZoneType" = 'boundary';
                """);

            // 3. Reset identity sequence to avoid future collisions
            migrationBuilder.Sql("""
                SELECT setval(
                    pg_get_serial_sequence('"Boundaries"', 'Id'),
                    COALESCE((SELECT MAX("Id") FROM "Boundaries"), 0) + 1,
                    false
                );
                """);

            // 4. Add BoundaryId to Parties
            migrationBuilder.AddColumn<long>(
                name: "BoundaryId",
                table: "Parties",
                type: "bigint",
                nullable: true);

            // 5. Populate BoundaryId from BoundaryZoneId (IDs are identical after the INSERT above)
            migrationBuilder.Sql("""
                UPDATE "Parties" SET "BoundaryId" = "BoundaryZoneId";
                """);

            // 6. Drop old BoundaryZoneId column
            migrationBuilder.DropColumn(name: "BoundaryZoneId", table: "Parties");

            // 7. Clear ZoneId on checkpoints that pointed at a boundary zone
            migrationBuilder.Sql("""
                UPDATE "Checkpoints" SET "ZoneId" = NULL
                WHERE "ZoneId" IN (SELECT "Id" FROM "Zones" WHERE "ZoneType" = 'boundary');
                """);

            // 8. Remove boundary rows from Zones table
            migrationBuilder.Sql("""
                DELETE FROM "Zones" WHERE "ZoneType" = 'boundary';
                """);

            // 9. Drop the unused Sections table
            migrationBuilder.DropTable(name: "Sections");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Recreate Sections table
            migrationBuilder.CreateTable(
                name: "Sections",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ZoneId = table.Column<long>(type: "bigint", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    CompletionCriteria = table.Column<string>(type: "text", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sections", x => x.Id);
                    table.ForeignKey("FK_Sections_Zones_ZoneId", x => x.ZoneId, "Zones", "Id", onDelete: ReferentialAction.Cascade);
                });

            // Restore BoundaryZoneId on Parties
            migrationBuilder.AddColumn<long>(
                name: "BoundaryZoneId",
                table: "Parties",
                type: "bigint",
                nullable: true);

            // Restore boundary zones from Boundaries back into Zones
            migrationBuilder.Sql("""
                INSERT INTO "Zones" ("Id", "Name", "ZoneType", "Color", "Boundary")
                SELECT "Id", "Name", 'boundary', "Color", "Geometry"
                FROM "Boundaries";
                """);

            migrationBuilder.Sql("""
                UPDATE "Parties" SET "BoundaryZoneId" = "BoundaryId";
                """);

            migrationBuilder.DropColumn(name: "BoundaryId", table: "Parties");

            migrationBuilder.DropTable(name: "Boundaries");
        }
    }
}
ParseOptions.0.jsonÅ
p/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427210000_AddZoneBoundaryId.cs˜using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(Goalz.Data.Storage.AppDbContext))]
    [Migration("20260427210000_AddZoneBoundaryId")]
    public partial class AddZoneBoundaryId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BoundaryId",
                table: "Zones",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Zones_BoundaryId",
                table: "Zones",
                column: "BoundaryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Zones_Boundaries_BoundaryId",
                table: "Zones",
                column: "BoundaryId",
                principalTable: "Boundaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Zones_Boundaries_BoundaryId",
                table: "Zones");

            migrationBuilder.DropIndex(
                name: "IX_Zones_BoundaryId",
                table: "Zones");

            migrationBuilder.DropColumn(
                name: "BoundaryId",
                table: "Zones");
        }
    }
}
ParseOptions.0.jsonö
k/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/20260427220000_DropZoneType.csïusing Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goalz.Data.Migrations
{
    [Microsoft.EntityFrameworkCore.Infrastructure.DbContext(typeof(Goalz.Data.Storage.AppDbContext))]
    [Migration("20260427220000_DropZoneType")]
    public partial class DropZoneType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ZoneType", table: "Zones");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ZoneType",
                table: "Zones",
                type: "text",
                nullable: false,
                defaultValue: "area");
        }
    }
}
ParseOptions.0.jsonóº
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Migrations/AppDbContextModelSnapshot.csìª// <auto-generated />
using System;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Goalz.Data.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.14")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.HasPostgresExtension(modelBuilder, "postgis");
            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("AnswerTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsCorrect")
                        .HasColumnType("boolean");

                    b.Property<long>("QuestionId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuestionId");

                    b.ToTable("Answer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Location")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long>("ReferenceId")
                        .HasColumnType("bigint");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("ZoneId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("ZoneId");

                    b.HasIndex("Type", "ReferenceId")
                        .IsUnique();

                    b.ToTable("Checkpoints");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("ElementName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("ElementTypeId")
                        .HasColumnType("integer");

                    b.Property<Point>("Geom")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("ImageUrl")
                        .HasColumnType("text");

                    b.Property<bool>("IsGreen")
                        .HasColumnType("boolean");

                    b.HasKey("Id");

                    b.HasIndex("ElementTypeId");

                    b.ToTable("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("ElementType", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AddresseeId")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<long>("RequesterId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("UpdatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("AddresseeId");

                    b.HasIndex("RequesterId", "AddresseeId")
                        .IsUnique();

                    b.ToTable("Friendships");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long?>("BoundaryId")
                        .HasColumnType("bigint");

                    b.Property<int?>("CheckpointsPerZone")
                        .HasColumnType("integer");

                    b.Property<long>("Code")
                        .HasColumnType("bigint");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<int?>("GroupSize")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long?>("QuizId")
                        .HasColumnType("bigint");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int?>("ZoneCount")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Parties");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("AnswerId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("ReceivedPoints")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("AnswerId");

                    b.HasIndex("PartyGroupId");

                    b.ToTable("PartyGroupAnswer");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("PartyGroupId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.Property<string>("Role")
                        .HasColumnType("text");

                    b.Property<long>("UserId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("PartyGroupId");

                    b.HasIndex("UserId");

                    b.ToTable("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("CheckpointId")
                        .HasColumnType("bigint");

                    b.Property<long>("PartyId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("CheckpointId");

                    b.HasIndex("PartyId");

                    b.ToTable("PartyVisitedCheckpoints", (string)null);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("QuestionTxt")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<long>("QuizId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("QuizId");

                    b.ToTable("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.HasKey("Id");

                    b.ToTable("Quiz");
                });


            modelBuilder.Entity("Goalz.Domain.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Point>("Geo")
                        .HasColumnType("geometry")
                        .HasColumnName("Geom");

                    b.Property<string>("SensorName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint")
                        .HasColumnName("id");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<long>("Humidity")
                        .HasColumnType("bigint");

                    b.Property<long>("Light")
                        .HasColumnType("bigint");

                    b.Property<long>("SensorsId")
                        .HasColumnType("bigint");

                    b.Property<double>("Temp")
                        .HasColumnType("double precision");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("timestamp with time zone");

                    b.HasKey("Id");

                    b.HasIndex("SensorsId");

                    b.ToTable("SensorData");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Boundary", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<Geometry>("Geometry")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("Geometry")
                        .HasAnnotation("Npgsql:IndexMethod", "gist");

                    b.ToTable("Boundaries");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<long>("Id"));

                    b.Property<Geometry>("Boundary")
                        .IsRequired()
                        .HasColumnType("geometry");

                    b.Property<long?>("BoundaryId")
                        .HasColumnType("bigint");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("BoundaryId");

                    b.ToTable("Zones");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Question", "Question")
                        .WithMany("Answers")
                        .HasForeignKey("QuestionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Question");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Checkpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Zone", "Zone")
                        .WithMany()
                        .HasForeignKey("ZoneId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.Navigation("Zone");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Element", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.ElementType", "ElementType")
                        .WithMany("Elements")
                        .HasForeignKey("ElementTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ElementType");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Friendship", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.User", "Addressee")
                        .WithMany("ReceivedFriendships")
                        .HasForeignKey("AddresseeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "Requester")
                        .WithMany("SentFriendships")
                        .HasForeignKey("RequesterId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Addressee");

                    b.Navigation("Requester");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Parties")
                        .HasForeignKey("QuizId");

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany("PartyGroups")
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroupAnswer", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Answer", "Answer")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("AnswerId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyGroupAnswers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Answer");

                    b.Navigation("PartyGroup");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyMember", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.PartyGroup", "PartyGroup")
                        .WithMany("PartyMembers")
                        .HasForeignKey("PartyGroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.User", "User")
                        .WithMany("PartyMembers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PartyGroup");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyVisitedCheckpoint", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Checkpoint", "Checkpoint")
                        .WithMany()
                        .HasForeignKey("CheckpointId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Goalz.Domain.Entities.Party", "Party")
                        .WithMany()
                        .HasForeignKey("PartyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Checkpoint");

                    b.Navigation("Party");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Quiz", "Quiz")
                        .WithMany("Questions")
                        .HasForeignKey("QuizId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Quiz");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Zone", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Boundary", null)
                        .WithMany()
                        .HasForeignKey("BoundaryId")
                        .OnDelete(DeleteBehavior.SetNull);
                });

            modelBuilder.Entity("Goalz.Domain.Entities.SensorData", b =>
                {
                    b.HasOne("Goalz.Domain.Entities.Sensor", "Sensor")
                        .WithMany()
                        .HasForeignKey("SensorsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Sensor");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Answer", b =>
                {
                    b.Navigation("PartyGroupAnswers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.ElementType", b =>
                {
                    b.Navigation("Elements");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Party", b =>
                {
                    b.Navigation("PartyGroups");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.PartyGroup", b =>
                {
                    b.Navigation("PartyGroupAnswers");

                    b.Navigation("PartyMembers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Question", b =>
                {
                    b.Navigation("Answers");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.Quiz", b =>
                {
                    b.Navigation("Parties");

                    b.Navigation("Questions");
                });

            modelBuilder.Entity("Goalz.Domain.Entities.User", b =>
                {
                    b.Navigation("PartyMembers");

                    b.Navigation("ReceivedFriendships");

                    b.Navigation("SentFriendships");
                });
#pragma warning restore 612, 618
        }
    }
}
ParseOptions.0.jsonÍ
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/AuthRepository.cs
using Goalz.Domain.Entities;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;

        public AuthRepository(AppDbContext context) 
        {
            _context = context;
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> CreateUserAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<IEnumerable<User>> GetAllStaffAndAdminAsync()
        {
            return await _context.Users
                .Where(u => u.Role == Role.Staff || u.Role == Role.Admin)
                .OrderBy(u => u.Name)
                .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(long id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task DeleteUserAsync(User user)
        {
            _context.Users.Remove(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
ParseOptions.0.json‚
d/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/BoundaryRepository.cs‰using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class BoundaryRepository : IBoundaryRepository
    {
        private readonly AppDbContext _context;

        public BoundaryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Boundary>> GetAllAsync()
            => await _context.Boundaries.ToListAsync();

        public async Task<Boundary?> GetByIdAsync(long id)
            => await _context.Boundaries.FindAsync(id);

        public async Task AddAsync(Boundary boundary)
            => await _context.Boundaries.AddAsync(boundary);

        public Task DeleteAsync(Boundary boundary)
        {
            _context.Boundaries.Remove(boundary);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
ParseOptions.0.json¶
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/CheckpointRepository.cs¶
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Goalz.Data.Repositories;

public class CheckpointRepository : ICheckpointRepository
{
    private readonly AppDbContext _context;

    public CheckpointRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Checkpoint>> GetAllAsync()
        => await _context.Checkpoints.ToListAsync();

    public async Task<IEnumerable<Checkpoint>> FindInsideBoundaryAsync(Geometry boundary)
        => await _context.Checkpoints
            .Include(c => c.Zone)
            .Where(c => boundary.Contains(c.Location))
            .ToListAsync();

    public async Task<Checkpoint?> GetByReferenceAsync(string type, long referenceId)
        => await _context.Checkpoints
            .FirstOrDefaultAsync(c => c.Type == type && c.ReferenceId == referenceId);

    public async Task AddAsync(Checkpoint checkpoint)
        => await _context.Checkpoints.AddAsync(checkpoint);

    public Task DeleteAsync(Checkpoint checkpoint)
    {
        _context.Checkpoints.Remove(checkpoint);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
        => await _context.SaveChangesAsync();
}
ParseOptions.0.jsonß
c/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/ElementRepository.cs™using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class ElementRepository : IElementRepository
{
    private readonly AppDbContext _context;

    public ElementRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Element> CreateAsync(Element element)
    {
        _context.Elements.Add(element);
        await _context.SaveChangesAsync();
        return element;
    }

    public async Task<Element?> GetByIdAsync(long id)
    {
        return await _context.Elements.Include(e => e.ElementType).FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<bool> UpdateAsync(Element element)
    {
        _context.Elements.Update(element);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var element = await _context.Elements.FindAsync(id);
        if (element is null) return false;
        _context.Elements.Remove(element);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<ElementType?> GetElementTypeByNameAsync(string name)
    {
        return await _context.ElementTypes
            .FirstOrDefaultAsync(et => et.Name.ToLower() == name.ToLower());
    }

    public async Task<ElementType> CreateElementTypeAsync(string name)
    {
        var elementType = new ElementType { Name = name };
        _context.ElementTypes.Add(elementType);
        await _context.SaveChangesAsync();
        return elementType;
    }

    public async Task<List<ElementType>> GetAllElementTypesAsync()
    {
        return await _context.ElementTypes.OrderBy(et => et.Name).ToListAsync();
    }

    public async Task<IEnumerable<Element>> GetByIdsAsync(IEnumerable<long> ids)
    {
        var idSet = ids.ToHashSet();
        return await _context.Elements.Where(e => idSet.Contains(e.Id)).ToListAsync();
    }

    public async Task<IEnumerable<Element>> GetAllAsync()
        => await _context.Elements.ToListAsync();
}
ParseOptions.0.json√
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/FriendshipRepository.cs√using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class FriendshipRepository : IFriendshipRepository
    {
        private readonly AppDbContext _context;

        public FriendshipRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Friendship friendship)
        {
            await _context.Friendships.AddAsync(friendship);
        }

        public async Task<Friendship?> GetByUsersAsync(long requesterId, long addresseeId)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f => f.RequesterId == requesterId && f.AddresseeId == addresseeId);
        }

        public async Task<Friendship?> GetBetweenUsersAsync(long userAId, long userBId)
        {
            return await _context.Friendships
                .FirstOrDefaultAsync(f =>
                    (f.RequesterId == userAId && f.AddresseeId == userBId) ||
                    (f.RequesterId == userBId && f.AddresseeId == userAId));
        }

        public async Task<IEnumerable<Friendship>> GetAcceptedAsync(long userId)
        {
            return await _context.Friendships
                .Include(f => f.Requester)
                .Include(f => f.Addressee)
                .Where(f => f.Status == FriendshipStatus.Accepted &&
                            (f.RequesterId == userId || f.AddresseeId == userId))
                .ToListAsync();
        }

        public async Task<IEnumerable<Friendship>> GetPendingReceivedAsync(long userId)
        {
            return await _context.Friendships
                .Include(f => f.Requester)
                .Where(f => f.Status == FriendshipStatus.Pending && f.AddresseeId == userId)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(long requesterId, long addresseeId)
        {
            return await _context.Friendships
                .AnyAsync(f => f.RequesterId == requesterId && f.AddresseeId == addresseeId);
        }

        public void DeleteAsync(Friendship friendship)
        {
            _context.Friendships.Remove(friendship);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
ParseOptions.0.json¬
i/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/NatureElementRepository.csøusing Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;

namespace Goalz.Data.Repositories
{
    public class NatureElementRepository : INatureElementRepository
    {
        private readonly AppDbContext _context;

        public NatureElementRepository(AppDbContext context)
        {
            _context = context;
        }

        public List<ElementType> GetAllElementTypes()
        {
            return _context.ElementTypes.ToList();
        }

        public void StoreElements(List<Element> elements)
        {
            _context.Elements.AddRange(elements);

            _context.SaveChanges();
        }

        public ElementType GetNatureElementTypeByName(string typeName)
        {
            return _context.ElementTypes.FirstOrDefault(e => e.Name == typeName);
        }
    }
}
ParseOptions.0.jsonı
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/OverviewRepositorycs.csıusing Goalz.Domain.Entities;
using Goalz.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Goalz.Data.Storage;

namespace Goalz.Data.Repositories;

public class OverviewRepository : IOverviewRepository
{
    private readonly AppDbContext _context;

    public OverviewRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Sensor>> GetAllSensorsAsync()
    {
        return await _context.Sensors.ToListAsync();
    }

    public async Task<List<Element>> GetAllElementsAsync()
    {
        return await _context.Elements.Include(e => e.ElementType).ToListAsync();
    }
}ParseOptions.0.jsonÈ'
a/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/PartyRepository.csÓ&using Goalz.Application.Interfaces;
using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
//Service k√ºmmert sich um Logik, Repository um Datenbankzugriff.
//mehrere Services k√∂nnen das gleiche Repository nutzen.
//wenn du die Datenbank wechselst, √§nderst du nur das Repository.

namespace Goalz.Data.Repositories
{
    public class PartyRepository(AppDbContext context) : IPartyRepository
    {
        private readonly AppDbContext _context = context; //muss innerhalb einer class sein, namespace akzeptiert keine deklarationen

        public async Task<PartyMember> AddMemberAsync(PartyMember member)
        {
            await _context.PartyMembers.AddAsync(member);
            await _context.SaveChangesAsync();
            return member;
        }

        public async Task<Party> CreateAsync(Party party)
        {
            await _context.Parties.AddAsync(party);
            await _context.SaveChangesAsync();
            return party;
        }

        public async Task<Party?> GetPartyById(long id)
        {
            return await _context.Parties
                .FirstOrDefaultAsync(p => p.Id == id); //<Party?> mit Fragezeichen, da somit auch ein nullable Wert zur√ºckgegeben werden kann. Error CS8603
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Party?> GetPartyByCode(long Code)
        {
            return await _context.Parties
                .FirstOrDefaultAsync(p => p.Code == Code);
        }
        public async Task<PartyGroup?> GetPartyGroupByPartyIdAsync(long partyId)
        {
            return await _context.PartyGroups
                .Where(pg => pg.PartyId == partyId)
                .OrderBy(pg => pg.PartyMembers.Count)
                .FirstOrDefaultAsync();
        }
        public async Task AddGroupAsync(PartyGroup group)
        {
            await _context.PartyGroups.AddAsync(group);
        }

        public async Task<List<string>> GetLobbyMembers(long partyId)
        {
            return await _context.PartyGroups
                .Where(pg => pg.PartyId == partyId)
                .SelectMany(pg => pg.PartyMembers)   
                .Select(pm => pm.User.Username)
                .ToListAsync();
        }

        public async Task<List<PartyMember>> GetPartyMembersWithUsersAsync(long partyId)
        {
            return await _context.PartyGroups
                .Where(pg => pg.PartyId == partyId)
                .SelectMany(pg => pg.PartyMembers)
                .Include(pm => pm.User)
                .ToListAsync();
        }

        public async Task<List<long>> GetVisitedCheckpointsAsync(long partyId)
        {
            return await _context.PartyVisitedCheckpoints
                .Where(pvc => pvc.PartyId == partyId)
                .Select(pvc => pvc.CheckpointId)
                .ToListAsync();
        }

        public async Task VisitCheckpointAsync(long partyId, long checkpointId)
        {
            var exists = await _context.PartyVisitedCheckpoints.AnyAsync(pvc => pvc.PartyId == partyId && pvc.CheckpointId == checkpointId);
            if (!exists)
            {
                await _context.PartyVisitedCheckpoints.AddAsync(new PartyVisitedCheckpoint { PartyId = partyId, CheckpointId = checkpointId });
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsMemberAsync(long partyId, long userId)
        {
            return await _context.PartyMembers.AnyAsync(pm => pm.PartyId == partyId && pm.UserId == userId);
        }

        public async Task<List<Party>> GetStaleLobbyPartiesAsync(DateTime cutoff)
        {
            return await _context.Parties
                .Where(p => p.Status == "Lobby" && p.CreatedAt < cutoff)
                .ToListAsync();
        }

        public async Task DeleteAsync(Party party)
        {
            var visitedCheckpoints = await _context.PartyVisitedCheckpoints
                .Where(pvc => pvc.PartyId == party.Id)
                .ToListAsync();
            _context.PartyVisitedCheckpoints.RemoveRange(visitedCheckpoints);

            var memberIds = await _context.PartyMembers
                .Where(pm => pm.PartyId == party.Id)
                .Select(pm => pm.Id)
                .ToListAsync();
            var members = await _context.PartyMembers
                .Where(pm => memberIds.Contains(pm.Id))
                .ToListAsync();
            _context.PartyMembers.RemoveRange(members);

            var groups = await _context.PartyGroups
                .Where(pg => pg.PartyId == party.Id)
                .ToListAsync();
            _context.PartyGroups.RemoveRange(groups);

            _context.Parties.Remove(party);
            await _context.SaveChangesAsync();
        }
    }
}ParseOptions.0.json
f/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/SensorDataRepository.csusing Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class SensorDataRepository : ISensorDataRepository
{
    private readonly AppDbContext _context;

    public SensorDataRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SensorData>> GetBySensorIdAsync(long sensorId)
    {
        return await _context.SensorData
            .Where(sd => sd.SensorsId == sensorId)
            .OrderByDescending(sd => sd.Timestamp)
            .ToListAsync();
    }

    public async Task<IEnumerable<SensorData>> GetSensorsByTimeRangeAsync(DateTime dateTimeFrom, DateTime dateTimeTo)
    {
        return await _context.SensorData.Where(s => s.Timestamp >= dateTimeFrom && s.Timestamp <= dateTimeTo).ToListAsync();
    }
}
ParseOptions.0.json≤
b/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/SensorRepository.cs∂
using System.Collections.Generic;
using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories;

public class SensorRepository : ISensorRepository
{
    private readonly AppDbContext _context;

    public SensorRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Sensor> CreateAsync(Sensor sensor)
    {
        _context.Sensors.Add(sensor);
        await _context.SaveChangesAsync();
        return sensor;
    }

    public async Task<Sensor?> GetByIdAsync(long id)
    {
        return await _context.Sensors.FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<bool> UpdateAsync(Sensor sensor)
    {
        _context.Sensors.Update(sensor);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(long id)
    {
        var sensor = await _context.Sensors.FindAsync(id);
        if (sensor is null) return false;
        _context.Sensors.Remove(sensor);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<Sensor>> GetByIdsAsync(IEnumerable<long> ids)
    {
        var idSet = ids.ToHashSet();
        return await _context.Sensors.Where(s => idSet.Contains(s.Id)).ToListAsync();
    }
}
ParseOptions.0.jsonˆ
`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/UserRepository.cs¸using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Goalz.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(long id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public async Task<IEnumerable<User>> SearchByUsernameAsync(string query, string excludeUsername, int limit = 10)
        {
            return await _context.Users
                .Where(u => u.Username != excludeUsername && u.Username.ToLower().Contains(query.ToLower()))
                .Take(limit)
                .ToListAsync();
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> ExistsByUsernameAsync(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
ParseOptions.0.jsonﬁ

`/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Repositories/ZoneRepository.cs‰	using Goalz.Core.Interfaces;
using Goalz.Data.Storage;
using Goalz.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace Goalz.Data.Repositories
{
    public class ZoneRepository : IZoneRepository
    {
        private readonly AppDbContext _context;

        public ZoneRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Zone>> GetAllAsync()
        {
            return await _context.Zones.ToListAsync();
        }

        public async Task<Zone?> GetByIdAsync(long id)
        {
            return await _context.Zones.FindAsync(id);
        }

        public async Task AddAsync(Zone zone)
        {
            await _context.Zones.AddAsync(zone);
        }

        public Task DeleteAsync(Zone zone)
        {
            _context.Zones.Remove(zone);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Zone?> FindContainingZoneAsync(Point point)
            => await _context.Zones
                .Where(z => z.Boundary.Contains(point))
                .FirstOrDefaultAsync();
    }
}
ParseOptions.0.jsonÊ 
Y/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/Storage/AppDbContext.csÛusing Microsoft.EntityFrameworkCore;
using Goalz.Domain.Entities;

namespace Goalz.Data.Storage
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Sensor> Sensors { get; set; }
        public DbSet<SensorData> SensorData { get; set; }
        public DbSet<Element> Elements { get; set; }
        public DbSet<Zone> Zones { get; set; }
        public DbSet<Boundary> Boundaries { get; set; }
        public DbSet<Checkpoint> Checkpoints { get; set; }
        public DbSet<ElementType> ElementTypes { get; set; }
        public DbSet<Party> Parties { get; set; }
        public DbSet<PartyMember> PartyMembers { get; set; }
        public DbSet<PartyGroup> PartyGroups { get; set; }
        public DbSet<PartyVisitedCheckpoint> PartyVisitedCheckpoints { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasPostgresExtension("postgis");

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Friendship>(entity =>
            {
                entity.Property(f => f.Status)
                    .HasConversion<string>();

                entity.HasOne(f => f.Requester)
                    .WithMany(u => u.SentFriendships)
                    .HasForeignKey(f => f.RequesterId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(f => f.Addressee)
                    .WithMany(u => u.ReceivedFriendships)
                    .HasForeignKey(f => f.AddresseeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(f => new { f.RequesterId, f.AddresseeId })
                    .IsUnique();
            });

            modelBuilder.Entity<Boundary>(entity =>
            {
                entity.HasIndex(b => b.Geometry).HasMethod("gist");
            });

            modelBuilder.Entity<Zone>(entity =>
            {
                entity.HasOne<Boundary>()
                    .WithMany()
                    .HasForeignKey(z => z.BoundaryId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(z => z.BoundaryId);
            });

            modelBuilder.Entity<Checkpoint>(entity =>
            {
                entity.HasOne(c => c.Zone)
                    .WithMany()
                    .HasForeignKey(c => c.ZoneId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(c => new { c.Type, c.ReferenceId }).IsUnique();
                entity.HasIndex(c => c.ZoneId);
            });

            modelBuilder.Entity<Sensor>()
                .Property(s => s.Geo).HasColumnName("Geom");

            modelBuilder.Entity<SensorData>(entity =>
            {
                entity.Property(sd => sd.Id).HasColumnName("id");
                entity.HasOne(sd => sd.Sensor)
                    .WithMany()
                    .HasForeignKey(sd => sd.SensorsId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ElementType>().ToTable("ElementType");

            modelBuilder.Entity<Element>(entity =>
            {
                entity.HasOne(e => e.ElementType)
                    .WithMany(et => et.Elements)
                    .HasForeignKey(e => e.ElementTypeId);
            });

            modelBuilder.Entity<PartyVisitedCheckpoint>(entity =>
            {
                entity.ToTable("PartyVisitedCheckpoints");
                entity.HasOne(pvc => pvc.Party)
                    .WithMany()
                    .HasForeignKey(pvc => pvc.PartyId);
                entity.HasOne(pvc => pvc.Checkpoint)
                    .WithMany()
                    .HasForeignKey(pvc => pvc.CheckpointId);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}
ParseOptions.0.json
o/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/obj/Debug/net9.0/Goalz.Data.GlobalUsings.g.csÁ// <auto-generated/>
global using System;
global using System.Collections.Generic;
global using System.IO;
global using System.Linq;
global using System.Net.Http;
global using System.Threading;
global using System.Threading.Tasks;
ParseOptions.0.jsonﬁ
Å/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/obj/Debug/net9.0/.NETCoreApp,Version=v9.0.AssemblyAttributes.cs¬// <autogenerated />
using System;
using System.Reflection;
[assembly: global::System.Runtime.Versioning.TargetFrameworkAttribute(".NETCoreApp,Version=v9.0", FrameworkDisplayName = ".NET 9.0")]
ParseOptions.0.json›
m/Users/carmensimon/VsProjects/lab4-goalz/backend/Goalz/Goalz.Data/obj/Debug/net9.0/Goalz.Data.AssemblyInfo.cs÷//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

using System;
using System.Reflection;

[assembly: System.Reflection.AssemblyCompanyAttribute("Goalz.Data")]
[assembly: System.Reflection.AssemblyConfigurationAttribute("Debug")]
[assembly: System.Reflection.AssemblyFileVersionAttribute("1.0.0.0")]
[assembly: System.Reflection.AssemblyInformationalVersionAttribute("1.0.0+386b1377d4b3d9193b1660fe8debbcb244aea640")]
[assembly: System.Reflection.AssemblyProductAttribute("Goalz.Data")]
[assembly: System.Reflection.AssemblyTitleAttribute("Goalz.Data")]
[assembly: System.Reflection.AssemblyVersionAttribute("1.0.0.0")]

// Generated by the MSBuild WriteCodeFragment class.

ParseOptions.0.json