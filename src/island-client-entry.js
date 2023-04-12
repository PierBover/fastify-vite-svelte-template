const islandElements = document.querySelectorAll('.island-boi');

islandElements.forEach((element) => {
	const data = JSON.parse(element.getAttribute('data-json'));
	console.log(data);
});