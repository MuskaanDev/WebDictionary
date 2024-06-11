package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Phonetic struct {
	Text  string `json:"text"`
	Audio string `json:"audio,omitempty"`
}

type Definition struct {
	Word      string     `json:"word"`
	Phonetic  string     `json:"phonetic"`
	Origin    string     `json:"origin"`
	Phonetics []Phonetic `json:"phonetics"`
	Meanings  []struct {
		PartOfSpeech string `json:"partOfSpeech"`
		Definitions  []struct {
			Definition string `json:"definition"`
			Example    string `json:"example"`
		} `json:"definitions"`
	} `json:"meanings"`
}

func main() {
	http.HandleFunc("/define/", getDefinition)
	fmt.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func getDefinition(w http.ResponseWriter, r *http.Request) {
	// Extract the word from the URL path
	word := r.URL.Path[len("/define/"):]
	if word == "" {
		http.Error(w, "Word not specified", http.StatusBadRequest)
		return
	}

	url := fmt.Sprintf("https://api.dictionaryapi.dev/api/v2/entries/en/%s", word)
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Failed to fetch definition: %v", err)
		http.Error(w, "Failed to fetch definition", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var definitions []Definition
	if err := json.NewDecoder(resp.Body).Decode(&definitions); err != nil {
		log.Printf("Failed to parse definition: %v", err)
		http.Error(w, "Failed to parse definition", http.StatusInternalServerError)
		return
	}

	if len(definitions) == 0 {
		http.Error(w, "No definition found", http.StatusNotFound)
		return
	}

	// Return the first definition for simplicity
	definition := definitions[0]

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(definition); err != nil {
		log.Printf("Failed to encode response: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
