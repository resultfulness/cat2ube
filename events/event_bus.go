package events

type EventBroker struct {
	channels []chan Event
}

func NewBroker() EventBroker {
	return EventBroker{
		channels: make([]chan Event, 0),
	}
}

func (b *EventBroker) Subscribe() <-chan Event {
	ch := make(chan Event, 10)
	b.channels = append(b.channels, ch)
	return ch
}

func (b *EventBroker) Publish(eventType EventType, id int, message ...string) {
	event := Event{
		Type: eventType,
		Data: EventData{ID: id},
	}
	if len(message) > 0 {
		event.Data.Message = message[0]
	}

	for _, ch := range b.channels {
		go func(c chan Event) {
			c <- event
		}(ch)
	}
}

func (b *EventBroker) Unsubscribe(ch <-chan Event) {
	for i, sub := range b.channels {
		if sub == ch {
			b.channels = append(b.channels[:i], b.channels[i+1:]...)
			close(sub)
			break
		}
	}
}
