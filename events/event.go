package events

import (
	"encoding/json"
	"fmt"
)

type EventType int

const (
	EventTypeQueued = iota
	EventTypeRunning
	EventTypeCompleted
	EventTypeFailed
	EventTypeInfo
	EventTypeMetadata
)

func (et EventType) toString() string {
	switch et {
	case EventTypeQueued:
		return "cattube:queued"
	case EventTypeRunning:
		return "cattube:running"
	case EventTypeCompleted:
		return "cattube:completed"
	case EventTypeFailed:
		return "cattube:failed"
	case EventTypeInfo:
		return "cattube:info"
	case EventTypeMetadata:
		return "cattube:metadata"
	default:
		panic("invalid event type")
	}
}

type EventData struct {
	ID      int    `json:"id"`
	Message string `json:"message,omitempty"`
}

type Event struct {
	Type EventType
	Data EventData
}

func (e *Event) ToSSEString() string {
	event := e.Type.toString()
	data, _ := json.Marshal(e.Data)
	return fmt.Sprintf("event: %s\ndata: %s\n\n", event, data)
}
