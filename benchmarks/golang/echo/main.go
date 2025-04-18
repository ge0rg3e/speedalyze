package main

import (
	"net/http"
	"strconv"
	"sync"
	"sync/atomic"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
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

// init populates initial items for testing
func init() {
	for i := 1; i <= 10; i++ {
		id := atomic.AddInt64(&nextID, 1)
		items[id] = Item{ID: id, Name: "item-" + strconv.Itoa(i), Value: i * 10}
	}
}

func main() {
	e := echo.New()

	// Optimize Echo for production
	e.HideBanner = true
	e.HidePort = true

	// Add performance-focused middleware
	e.Use(middleware.Recover())
	e.Use(middleware.Gzip())
	e.Use(middleware.BodyLimit("2M"))

	// API routes for K6 benchmarking
	e.GET("/items", listItems)
	e.GET("/items/:id", getItem)
	e.POST("/items", createItem)
	e.PUT("/items/:id", updateItem)
	e.DELETE("/items/:id", deleteItem)

	e.Logger.Fatal(e.Start(":8080"))
}

// listItems returns all items from memory
func listItems(c echo.Context) error {
	mu.RLock()
	defer mu.RUnlock()
	result := make([]Item, 0, len(items))
	for _, item := range items {
		result = append(result, item)
	}
	return c.JSON(http.StatusOK, result)
}

// getItem returns an item by ID
func getItem(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	mu.RLock()
	item, ok := items[id]
	mu.RUnlock()
	if !ok {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "item not found"})
	}
	return c.JSON(http.StatusOK, item)
}

// createItem adds a new item
func createItem(c echo.Context) error {
	var input struct {
		Name  string `json:"name"`
		Value int    `json:"value"`
	}
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	id := atomic.AddInt64(&nextID, 1)
	item := Item{ID: id, Name: input.Name, Value: input.Value}
	mu.Lock()
	items[id] = item
	mu.Unlock()
	return c.JSON(http.StatusCreated, item)
}

// updateItem modifies an existing item
func updateItem(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	var input struct {
		Name  string `json:"name"`
		Value int    `json:"value"`
	}
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	mu.Lock()
	defer mu.Unlock()
	if _, ok := items[id]; !ok {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "item not found"})
	}
	item := Item{ID: id, Name: input.Name, Value: input.Value}
	items[id] = item
	return c.JSON(http.StatusOK, item)
}

// deleteItem removes an item
func deleteItem(c echo.Context) error {
	id, err := parseID(c)
	if err != nil {
		return err
	}
	mu.Lock()
	defer mu.Unlock()
	if _, ok := items[id]; !ok {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "item not found"})
	}
	delete(items, id)
	return c.NoContent(http.StatusNoContent)
}

// parseID extracts and validates the :id parameter
func parseID(c echo.Context) (int64, error) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return 0, c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid id"})
	}
	return id, nil
}
