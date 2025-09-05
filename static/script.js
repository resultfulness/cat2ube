import events from "./events.js";

window.app = {};
window.$ = s => document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
    app.events = events;
    app.downloadForm = $(".download-form"),
    app.queue = {
        element: $(".queue-list"),
        children: new Map(),
        add(id, text) {
            const li = document.createElement("li");
            li.textContent = text;
            this.children.set(id, li);
            this.element.append(li);
        },
        del(id) {
            this.children.get(id).remove();
            this.children.delete(id);
        },
        setText(id, text) {
            this.children.get(id).textContent = text;
        }
    };
    app.progress = {
        element: $(".progress-bar-fill"),
        set(p) {
            this.element.style.width = parseInt(p.replace("%", "")) + "%";
        },
        reset() {
            this.element.style.width = "0%";
        }
    };
    app.info = {
        element: $(".info-content"),
        insert(text) {
            const d = document.createElement("div");
            d.textContent = text;
            this.element.insertBefore(d, this.element.firstChild);
            return d;
        },
        insertError(text) {
            const d = this.insert("[error] " + text);
            d.style.color = "tomato";
        }
    }
    app.eventSource = new EventSource("/sync");
    app.eventSource.onerror = function(event) {
        console.error(event);
    };
    app.eventSource.listen = function(event, onevent) {
        this.addEventListener(
            `cattube:${event}`,
            (e => { onevent(JSON.parse(e.data)) })
        );
    }

    app.eventSource.listen("initial", app.events.init);
    app.eventSource.listen("queued", app.events.onqueued);
    app.eventSource.listen("running", app.events.onrunning);
    app.eventSource.listen("completed", app.events.oncompleted);
    app.eventSource.listen("failed", app.events.onfailed);
    app.eventSource.listen("info", app.events.oninfo);

    app.downloadForm.addEventListener("submit", e => {
        e.preventDefault();

        const url = e.target.querySelector(".download-form__input").value;
        const d = new FormData();
        d.append("url", url);

        fetch("/download", {
            method: "POST",
            body: d
        }).catch(e => console.error(e));
    });
});

window.addEventListener("beforeunload", (e) => {
    if (app.eventSource) {
        app.eventSource.close();
    }
});
