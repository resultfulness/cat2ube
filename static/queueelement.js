class QueueElement extends HTMLElement {
    constructor() {
        super();

        this.imgSrc = "https://placehold.co/600x400?text=video"
        this.titleText = "..."
        this.urlText = "..."
    }

    setImgSrc(imgSrc) {
        if (!imgSrc) return;
        this.imgSrc = imgSrc
        if (this.img) this.img.src = this.imgSrc;
    }

    setTitleText(titleText) {
        if (!titleText) return;
        this.titleText = titleText
        if (this._title) this._title.textContent = this.titleText;
    }

    setUrlText(urlText) {
        if (!urlText) return;
        this.urlText = urlText
        if (this.url) this.url.textContent = this.urlText;
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });

        const li = document.createElement("li")
        li.setAttribute("class", "queued");

        this.img = document.createElement("img");
        this.img.setAttribute("class", "queued-icon")
        this.img.src = this.imgSrc;

        this._title = document.createElement("p");
        this._title.setAttribute("class", "queued-title");
        this._title.textContent = this.titleText;

        this.url = document.createElement("p");
        this.url.setAttribute("class", "queued-url");
        this.url.textContent = this.urlText;

        const style = document.createElement("style");

        style.textContent = `
.queued {
    background-color: #282828;
    border-radius: 0.5rem;
    padding: 0.5rem;

    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr 1fr;
    align-items: center;
    gap: 0 0.5rem;
}

.queued-icon {
    grid-row: span 2;
    display: block;
    height: 4rem;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 0.25rem;
}

.queued-url, .queued-title {
    margin: 0;
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.queued-title {
    font-size: 1.125rem;
    font-weight: 500;
}
.queued-url {
    color: grey;
}
`;

        shadow.appendChild(style);
        shadow.appendChild(li);
        li.append(this.img, this._title, this.url);
    }
}

customElements.define("queue-element", QueueElement);
