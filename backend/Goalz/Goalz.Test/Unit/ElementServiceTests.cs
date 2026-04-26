using Goalz.Core.DTOs;
using Goalz.Core.Interfaces;
using Goalz.Core.Services;
using Goalz.Domain.Entities;
using Moq;
using NetTopologySuite.Geometries;

namespace Goalz.Test.Unit
{
    [TestClass]
    public class ElementServiceTests
    {
        private Mock<IElementRepository> _elementRepoMock = null!;
        private ElementService _sut = null!;

        private static ElementType MakeType(int id, string name) => new() { Id = id, Name = name };

        private static Element MakeElement(long id, string name, ElementType type) => new()
        {
            Id = id,
            ElementName = name,
            ElementTypeId = type.Id,
            ElementType = type,
            Geom = new Point(10.0, 48.0) { SRID = 4326 },
            IsGreen = true
        };

        [TestInitialize]
        public void Setup()
        {
            _elementRepoMock = new Mock<IElementRepository>();
            _sut = new ElementService(_elementRepoMock.Object);
        }

        // ── CreateAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task CreateAsync_ExistingElementType_UsesExistingTypeAndReturnsElement()
        {
            var existingType = MakeType(3, "Tree");
            var createdElement = MakeElement(1, "Ancient Oak", existingType);

            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Tree")).ReturnsAsync(existingType);
            _elementRepoMock.Setup(r => r.CreateAsync(It.IsAny<Element>())).ReturnsAsync(createdElement);

            var result = await _sut.CreateAsync(new CreateElementRequest
            {
                ElementName = "Ancient Oak",
                ElementType = "Tree",
                Longitude = 10.0,
                Latitude = 48.0,
                IsGreen = true
            });

            Assert.IsNotNull(result);
            Assert.AreEqual(1L, result.Id);
            Assert.AreEqual("Ancient Oak", result.ElementName);
            _elementRepoMock.Verify(r => r.CreateElementTypeAsync(It.IsAny<string>()), Times.Never);
        }

        [TestMethod]
        public async Task CreateAsync_NewElementType_CreatesTypeBeforePersistingElement()
        {
            var newType = MakeType(99, "Shrub");
            var createdElement = MakeElement(5, "Lavender", newType);

            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Shrub")).ReturnsAsync((ElementType?)null);
            _elementRepoMock.Setup(r => r.CreateElementTypeAsync("Shrub")).ReturnsAsync(newType);
            _elementRepoMock.Setup(r => r.CreateAsync(It.IsAny<Element>())).ReturnsAsync(createdElement);

            var result = await _sut.CreateAsync(new CreateElementRequest
            {
                ElementName = "Lavender",
                ElementType = "Shrub",
                Longitude = 11.0,
                Latitude = 49.0,
                IsGreen = true
            });

            Assert.IsNotNull(result);
            _elementRepoMock.Verify(r => r.CreateElementTypeAsync("Shrub"), Times.Once);
        }

        [TestMethod]
        public async Task CreateAsync_ValidRequest_BuildsPointWithCorrectCoordinates()
        {
            var type = MakeType(1, "Rock");
            Element? capturedElement = null;
            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Rock")).ReturnsAsync(type);
            _elementRepoMock.Setup(r => r.CreateAsync(It.IsAny<Element>()))
                .Callback<Element>(e => capturedElement = e)
                .ReturnsAsync((Element e) => e);

            await _sut.CreateAsync(new CreateElementRequest
            {
                ElementName = "Big Rock",
                ElementType = "Rock",
                Longitude = 13.5,
                Latitude = 47.5,
                IsGreen = false
            });

            Assert.IsNotNull(capturedElement);
            Assert.AreEqual(13.5, capturedElement!.Geom.X, 0.0001);
            Assert.AreEqual(47.5, capturedElement.Geom.Y, 0.0001);
            Assert.AreEqual(4326, capturedElement.Geom.SRID);
        }

        [TestMethod]
        public async Task CreateAsync_NullImageUrl_SetsEmptyString()
        {
            var type = MakeType(1, "Tree");
            Element? capturedElement = null;
            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Tree")).ReturnsAsync(type);
            _elementRepoMock.Setup(r => r.CreateAsync(It.IsAny<Element>()))
                .Callback<Element>(e => capturedElement = e)
                .ReturnsAsync((Element e) => e);

            await _sut.CreateAsync(new CreateElementRequest
            {
                ElementName = "Oak",
                ElementType = "Tree",
                Longitude = 0,
                Latitude = 0,
                ImageUrl = null,
                IsGreen = true
            });

            Assert.AreEqual(string.Empty, capturedElement!.ImageUrl);
        }

        [TestMethod]
        public async Task CreateAsync_ProvidedImageUrl_IsPreserved()
        {
            var type = MakeType(1, "Tree");
            Element? capturedElement = null;
            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Tree")).ReturnsAsync(type);
            _elementRepoMock.Setup(r => r.CreateAsync(It.IsAny<Element>()))
                .Callback<Element>(e => capturedElement = e)
                .ReturnsAsync((Element e) => e);

            await _sut.CreateAsync(new CreateElementRequest
            {
                ElementName = "Oak",
                ElementType = "Tree",
                Longitude = 0,
                Latitude = 0,
                ImageUrl = "https://cdn.example.com/oak.jpg",
                IsGreen = true
            });

            Assert.AreEqual("https://cdn.example.com/oak.jpg", capturedElement!.ImageUrl);
        }

        // ── UpdateAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task UpdateAsync_ExistingElement_ReturnsSuccessAndUpdatesFields()
        {
            var type = MakeType(2, "Flower");
            var element = MakeElement(10, "Rose", MakeType(1, "Tree"));
            _elementRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(element);
            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Flower")).ReturnsAsync(type);
            _elementRepoMock.Setup(r => r.UpdateAsync(element)).ReturnsAsync(true);

            var (success, error) = await _sut.UpdateAsync(10, new UpdateElementRequest
            {
                ElementName = "Daisy",
                ElementType = "Flower",
                Longitude = 9.5,
                Latitude = 47.5,
                IsGreen = false
            });

            Assert.IsTrue(success);
            Assert.IsNull(error);
            Assert.AreEqual("Daisy", element.ElementName);
            Assert.AreEqual(2, element.ElementTypeId);
            Assert.AreEqual(9.5, element.Geom.X, 0.0001);
            Assert.AreEqual(47.5, element.Geom.Y, 0.0001);
            Assert.IsFalse(element.IsGreen);
        }

        [TestMethod]
        public async Task UpdateAsync_ElementNotFound_ReturnsNotFoundError()
        {
            _elementRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<long>())).ReturnsAsync((Element?)null);

            var (success, error) = await _sut.UpdateAsync(999, new UpdateElementRequest
            {
                ElementName = "X",
                ElementType = "Tree",
                Longitude = 0,
                Latitude = 0
            });

            Assert.IsFalse(success);
            Assert.AreEqual("not_found", error);
            _elementRepoMock.Verify(r => r.UpdateAsync(It.IsAny<Element>()), Times.Never);
        }

        [TestMethod]
        public async Task UpdateAsync_ElementTypeNotFound_CreatesNewType()
        {
            var element = MakeElement(1, "Oak", MakeType(1, "Tree"));
            var newType = MakeType(5, "Grass");
            _elementRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(element);
            _elementRepoMock.Setup(r => r.GetElementTypeByNameAsync("Grass")).ReturnsAsync((ElementType?)null);
            _elementRepoMock.Setup(r => r.CreateElementTypeAsync("Grass")).ReturnsAsync(newType);
            _elementRepoMock.Setup(r => r.UpdateAsync(element)).ReturnsAsync(true);

            var (success, _) = await _sut.UpdateAsync(1, new UpdateElementRequest
            {
                ElementName = "Lawn",
                ElementType = "Grass",
                Longitude = 0,
                Latitude = 0
            });

            Assert.IsTrue(success);
            _elementRepoMock.Verify(r => r.CreateElementTypeAsync("Grass"), Times.Once);
        }

        // ── DeleteAsync ──────────────────────────────────────────────────────────

        [TestMethod]
        public async Task DeleteAsync_ExistingElement_ReturnsSuccess()
        {
            _elementRepoMock.Setup(r => r.DeleteAsync(8)).ReturnsAsync(true);

            var (success, error) = await _sut.DeleteAsync(8);

            Assert.IsTrue(success);
            Assert.IsNull(error);
        }

        [TestMethod]
        public async Task DeleteAsync_NonExistentElement_ReturnsNotFoundError()
        {
            _elementRepoMock.Setup(r => r.DeleteAsync(It.IsAny<long>())).ReturnsAsync(false);

            var (success, error) = await _sut.DeleteAsync(404);

            Assert.IsFalse(success);
            Assert.AreEqual("not_found", error);
        }

        [TestMethod]
        public async Task DeleteAsync_CallsRepositoryDeleteWithCorrectId()
        {
            _elementRepoMock.Setup(r => r.DeleteAsync(55)).ReturnsAsync(true);

            await _sut.DeleteAsync(55);

            _elementRepoMock.Verify(r => r.DeleteAsync(55), Times.Once);
        }
    }
}
