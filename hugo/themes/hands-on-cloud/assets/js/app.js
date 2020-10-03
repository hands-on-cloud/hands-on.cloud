// menu icon functionality
function DeferLoadImages() {
	var imgDefer = document.getElementsByTagName('img');
	for (var i=0; i<imgDefer.length; i++) {
		if(imgDefer[i].getAttribute('data-lazy-src')) {
			imgDefer[i].setAttribute('src',imgDefer[i].getAttribute('data-lazy-src'));
		}
	}
}

$(document).ready(function($){
	let pageOverlap = $(".page-overlap");
	let menuIcon = $('.header-nav-icon');
	let menuContent = $('#mob-Navigation');
	let siteBody = $('body');
	events();

	function events() {
	menuIcon.on('click', function() {
		toggleTheMenu();
	})

	}

	function toggleTheMenu() {
		menuContent.toggleClass("open");
		pageOverlap.toggleClass("open");
		menuIcon.toggleClass('open');
		siteBody.toggleClass('no-scroll');
	}

	DeferLoadImages();

	$("#TableOfContents").scrollspy({ offset: -85 });

	const tags = document.getElementsByTagName('meta')['keywords']['content'].replace(',', '');
	if (tags != undefined) {
		const url = "https://api.hands-on.cloud/?tags=" + tags;
		$.get(url, function(a) {
			const data = JSON.parse(a);
			data.forEach(element => {
				var div_item = $('<div>', {class: 'carousel-item'});
				var div_item_a = $('<a>',{href: element.linkurl});
				var div_item_img = $('<img>',{src: element.imageurl, class: 'd-block w-100', alt: element.productname});
				var div_item_caption = $('<div>',{class: 'carousel-caption d-none d-md-block'});
				var div_item_caption_h6 = $('<h6>',{text: element.productname});

				var banner = div_item.append(div_item_a.append(div_item_img, div_item_caption.append(div_item_caption_h6)));
				$("div.linkshare_carousel div.carousel-inner").append(banner);
				$("div.linkshare_carousel div.carousel-inner div.carousel-item:first").addClass("active");
			});
		});
	}
})