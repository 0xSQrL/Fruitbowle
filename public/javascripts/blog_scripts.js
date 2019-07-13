let stars_count = 0;

function generate_stars(post_id, rating, parent, can_rate = true, user_rating = 0){
	if(user_rating !== 0)
		rating = 0;
	const svgNS = "http://www.w3.org/2000/svg";
	const xlinkNS = "http://www.w3.org/1999/xlink";

	const star_shape = "M 55 5 l 0 20 l 5 0 q 30 0 30 30 q 0 10 -10 10 q 0 70 -30 70 q -30 0 -30 -70 q -10 0 -10 -10 q 0 -30 30 -30 l 5 0 l 0 -20 Z";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("viewBox", "0 0 500 150");
	svg.setAttribute("preserveAspectRatio", "none");
	const mask = document.createElementNS(svgNS,"mask");
	mask.setAttribute("id", `stars_mask${stars_count}`);
	const mask_path = document.createElementNS(svgNS,"path");
	mask_path.setAttribute("d", star_shape);
	mask_path.setAttribute("fill", "white");
	mask_path.setAttribute("transform", `translate(0,0)`);
	mask_path.setAttribute("id", `mask_path${stars_count}`);
	mask.appendChild(mask_path);
	for(let i = 1; i < 5; i++){
		const mask_copy = document.createElementNS(svgNS,"use");
		mask_copy.setAttributeNS(xlinkNS, "href", `#mask_path${stars_count}`);
		mask_copy.setAttribute("transform", `translate(${i * 100},0)`);
		mask.appendChild(mask_copy);
	}
	const rendering = document.createElementNS(svgNS,"g");
	const masked = document.createElementNS(svgNS,"g");
	masked.setAttribute("mask", `url(#stars_mask${stars_count})`);
	rendering.appendChild(masked);
	const highlightColor = document.createElementNS(svgNS,"rect");
	const backingColor = document.createElementNS(svgNS,"rect");
	const topColor = document.createElementNS(svgNS,"rect");
	const bottomColor = document.createElementNS(svgNS,"rect");
	{
		topColor.setAttribute("x", 0);
		topColor.setAttribute("y", 5);
		topColor.setAttribute("height", 62);
		topColor.setAttribute("width", rating * 100);
		topColor.setAttribute("fill", "#985B33");

		backingColor.setAttribute("x", 0);
		backingColor.setAttribute("y", 5);
		backingColor.setAttribute("height", 150);
		backingColor.setAttribute("width", 500);
		backingColor.setAttribute("fill", "#FFFFFF77");

		bottomColor.setAttribute("x", 0);
		bottomColor.setAttribute("y", 65);
		bottomColor.setAttribute("height", 90);
		bottomColor.setAttribute("width", rating * 100);
		bottomColor.setAttribute("fill", "#E5884E");

		highlightColor.setAttribute("x", 0);
		highlightColor.setAttribute("y", 5);
		highlightColor.setAttribute("height", 150);
		highlightColor.setAttribute("width", user_rating * 100);
		highlightColor.setAttribute("fill", "gold");
		masked.appendChild(backingColor);
		masked.appendChild(topColor);
		masked.appendChild(bottomColor);
		masked.appendChild(highlightColor);
	}

	const outline_paths = [
		document.createElementNS(svgNS,"path"),
		document.createElementNS(svgNS,"use"),
		document.createElementNS(svgNS,"use"),
		document.createElementNS(svgNS,"use"),
		document.createElementNS(svgNS,"use")
		];
	outline_paths[0].setAttribute("d", star_shape);
	outline_paths[0].setAttribute("fill", "#00000000");
	outline_paths[0].setAttribute("stroke", "black");
	outline_paths[0].setAttribute("stroke-width", "5");
	outline_paths[0].setAttribute("id", `star_outline_path${stars_count}`);
	rendering.appendChild(outline_paths[0]);

	for(let i = 1; i < 5; i++){
		outline_paths[i].setAttributeNS(xlinkNS, "href", `#star_outline_path${stars_count}`);
		outline_paths[i].setAttribute("transform", `translate(${i * 100},0)`);
		rendering.appendChild(outline_paths[i]);
	}
	if(can_rate) {
		for (let i = 0; i < 5; i++) {
			outline_paths[i].addEventListener("mouseover", function (event) {
				topColor.setAttribute("width", 0);
				bottomColor.setAttribute("width", 0);
				highlightColor.setAttribute("width", (i + 1) * 100);
			});
			outline_paths[i].addEventListener("mouseleave", function (event) {
				topColor.setAttribute("width", rating * 100);
				bottomColor.setAttribute("width", rating * 100);
				highlightColor.setAttribute("width", user_rating * 100);
			});
			outline_paths[i].addEventListener("click", function (event) {
				rating = 0;
				user_rating = i + 1;
			});
		}
	}
	svg.appendChild(mask);
	svg.appendChild(rendering);
	parent.appendChild(svg);
}

function generate_post_preview(post_data, parent){
	const housing = document.createElement("div");
	const title = document.createElement("p");
	title.setAttribute("class", "article_preview_title");
	title.appendChild(document.createTextNode(post_data.title));
	generate_stars(post_data.id, post_data.rating, title, false, post_data.user_rating);
	const writer = document.createElement("p");
	writer.setAttribute("class", "article_preview_writer");
	writer.appendChild(document.createTextNode(post_data.writer_name));

}