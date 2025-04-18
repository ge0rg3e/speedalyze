package main

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"sync/atomic"

	"github.com/gin-gonic/gin"
)

// Item represents the entity being tested in the API
// ID: unique identifier
// Name: item name
// Value: associated value
type Item struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Value int    `json:"value"`
}

var (
	items  = make(map[int64]Item)
	mu     sync.RWMutex
	nextID int64 = 0
)

// init populates the initial list of items for testing
func init() {
	for i := 1; i <= 10; i++ {
		id := atomic.AddInt64(&nextID, 1)
		items[id] = Item{ID: id, Name: fmt.Sprintf("item-%d", i), Value: i * 10}
	}
}

func main() {
	// Set Gin to release mode for maximum performance
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())

	// API routes for K6 benchmarking
	router.GET("/items", listItems)
	router.GET("/items/:id", getItem)
	router.POST("/items", createItem)
	router.PUT("/items/:id", updateItem)
	router.DELETE("/items/:id", deleteItem)

	// Start server on port 8080
	router.Run(":8080")
}

// listItems returns all items from memory
func listItems(c *gin.Context) {
	mu.RLock()
	defer mu.RUnlock()
	result := make([]Item, 0, len(items))
	for _, item := range items {
		result = append(result, item)
	}
	c.JSON(http.StatusOK, result)
}

// getItem returns a single item by ID
func getItem(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	mu.RLock()
	item, ok := items[id]
	mu.RUnlock()
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

// createItem adds a new item
func createItem(c *gin.Context) {
	var input struct {
		Name  string `json:"name" binding:"required"`
		Value int    `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id := atomic.AddInt64(&nextID, 1)
	item := Item{ID: id, Name: input.Name, Value: input.Value}
	mu.Lock()
	items[id] = item
	mu.Unlock()
	c.JSON(http.StatusCreated, item)
}

// updateItem modifies an existing item
func updateItem(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	var input struct {
		Name  string `json:"name" binding:"required"`
		Value int    `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	mu.Lock()
	defer mu.Unlock()
	if _, ok := items[id]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}
	item := Item{ID: id, Name: input.Name, Value: input.Value}
	items[id] = item
	c.JSON(http.StatusOK, item)
}

// deleteItem removes an item
func deleteItem(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	mu.Lock()
	defer mu.Unlock()
	if _, ok := items[id]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "item not found"})
		return
	}
	delete(items, id)
	c.Status(http.StatusNoContent)
}

// parseID extracts and validates the :id parameter
func parseID(c *gin.Context) (int64, error) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return 0, err
	}
	return id, nil
}
