function GenerateTitleBar(){
	let topBar = document.createElement("div");
	topBar.setAttribute("class", "top_bar");
	let paw = document.createElement("img");
	paw.setAttribute("class", "logo");
	paw.setAttribute("src", "/public/images/kass/KASS_t.png");
	topBar.appendChild(paw);
	let text = document.createElement("span");
	text.innerText = "Kennesaw Anthropomorphic Student Society";
	text.setAttribute("class", "top_text");
	topBar.appendChild(text);
	document.body.insertBefore(topBar, document.body.firstChild);
	let content = document.createElement("div");
	content.setAttribute("class", "content");
	document.body.appendChild(content);

}
