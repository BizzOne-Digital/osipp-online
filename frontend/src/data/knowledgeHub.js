// Content for the /learn/:slug knowledge-hub pages — each entry becomes its own indexable
// page with unique title/meta/content for SEO ("What is Canadian whisky?" style searches).
// Add more entries here as new guides come in — no new routing/page code needed.
const knowledgeHub = {
  beer: {
    title: 'Beer Knowledge Hub',
    metaDescription: "Everything you need to know about beer — ingredients, brewing, lager vs ale, IPA, stout, ABV, food pairings and more. Answered by OSIPP.",
    intro: "From what's in your glass to how it's brewed, here's everything to know about beer.",
    qa: [
      { q: 'What is beer?', a: 'Beer is an alcoholic beverage made by fermenting grains (mainly barley), water, hops, and yeast. It is one of the oldest fermented drinks in the world.' },
      { q: 'What are the main ingredients in beer?', a: "The four main ingredients are water, malted grains, hops, and yeast. Each ingredient plays an important role in creating the beer's flavour and character." },
      { q: 'How is beer made?', a: 'Beer is made through a process called brewing. The grains are mashed to extract sugars, hops are added for flavour and bitterness, yeast ferments the sugars into alcohol, and the beer is then aged and packaged.' },
      { q: 'What does yeast do in beer production?', a: 'Yeast converts the natural sugars from malt into alcohol and carbon dioxide during fermentation.' },
      { q: 'What role do hops play in beer?', a: 'Hops add bitterness to balance the sweetness of malt and provide flavours and aromas such as citrus, floral, herbal, or spicy notes.' },
      { q: 'What is malt in beer?', a: 'Malt is grain, usually barley, that has been prepared for brewing. It provides the sugars needed for fermentation and creates flavours like caramel, toast, and sweetness.' },
      { q: 'What is the difference between lager and ale?', a: 'Lager uses bottom-fermenting yeast at cooler temperatures, creating a clean and crisp taste. Ale uses top-fermenting yeast at warmer temperatures, often producing richer and fruitier flavours.' },
      { q: 'What is a pilsner beer?', a: 'A pilsner is a type of lager known for its light colour, refreshing taste, crisp finish, and mild hop character.' },
      { q: 'What is an IPA beer?', a: 'IPA stands for India Pale Ale. It is known for stronger hop flavours and aromas, often including citrus, tropical fruit, pine, or floral notes.' },
      { q: 'What is a stout beer?', a: 'Stout is a dark beer style with roasted flavours such as coffee, chocolate, caramel, and toasted grains.' },
      { q: 'What is a wheat beer?', a: 'Wheat beer is brewed using a large portion of wheat along with barley, creating a smooth texture and refreshing taste.' },
      { q: 'What does ABV mean on a beer label?', a: 'ABV means Alcohol By Volume. It shows the percentage of alcohol contained in the beer.' },
      { q: 'Why does beer have foam?', a: 'Beer foam is created when carbon dioxide escapes from the beer. The foam helps release aromas and improves the drinking experience.' },
      { q: 'Why is beer served cold?', a: 'Cold temperatures help maintain freshness, improve refreshment, and enhance the flavours of many beer styles.' },
      { q: 'What is craft beer?', a: 'Craft beer is produced by smaller independent breweries that focus on unique flavours, quality ingredients, and creative brewing methods.' },
      { q: 'What is the difference between canned beer and bottled beer?', a: 'Both can contain the same beer, but cans often protect beer better from light and oxygen, helping maintain freshness.' },
      { q: 'Does beer expire?', a: 'Beer usually has a best-before date. While it may still be safe afterward, its freshness, flavour, and aroma can decrease over time.' },
      { q: 'What foods pair well with beer?', a: 'Different beers pair with different foods. Lager pairs well with burgers, pizza, and seafood. IPA pairs well with spicy foods. Stout pairs well with chocolate desserts and grilled meats.' },
      { q: 'What are some popular beer styles around the world?', a: 'Popular styles include lager, pilsner, IPA, stout, porter, wheat beer, sour beer, and pale ale.' },
      { q: 'Why is beer popular in Canada?', a: 'Beer is popular in Canada because of its long brewing history, quality ingredients, wide variety of styles, and strong craft beer culture.' }
    ],
    shopLink: { to: '/products?cat=Beer', label: 'Shop Beer' }
  },
  'canadian-whisky': {
    title: 'Canadian Whisky Knowledge Hub',
    metaDescription: 'Everything you need to know about Canadian whisky — grains, aging rules, taste, top brands like Crown Royal and Canadian Club, and how it compares to bourbon and Scotch.',
    intro: 'Smooth, versatile, and uniquely Canadian — here is everything to know about Canadian whisky.',
    qa: [
      { q: 'What is Canadian whisky?', a: 'Canadian whisky is a whisky produced in Canada using grains such as corn, rye, wheat, and barley. It is known for being smooth, light-bodied, and versatile.' },
      { q: 'Why is Canadian whisky called "rye whisky"?', a: 'Canadian whisky is often called rye because rye grain has historically been an important part of Canadian whisky production. However, Canadian whisky does not always have to contain mostly rye.' },
      { q: 'What grains are used to make Canadian whisky?', a: 'Canadian whisky can be made using corn, rye, wheat, and malted barley. Many Canadian distillers use blends of different grains to create flavour profiles.' },
      { q: 'How long must Canadian whisky be aged?', a: 'Canadian whisky must be aged for at least three years in small wooden barrels according to Canadian regulations.' },
      { q: 'What makes Canadian whisky different from American bourbon?', a: 'Bourbon is mainly made from corn and follows U.S. rules, while Canadian whisky often uses blended grain recipes with a lighter and smoother style.' },
      { q: 'Is Canadian whisky always made with rye?', a: 'No. Canadian whisky may contain rye, but it does not have to be rye-dominant. Rye became a traditional nickname for Canadian whisky.' },
      { q: 'What does Canadian whisky taste like?', a: 'Canadian whisky is usually smooth with flavours like vanilla, caramel, oak, spice, fruit, and light pepper notes.' },
      { q: 'What are some famous Canadian whisky brands?', a: 'Popular brands include Crown Royal, Canadian Club, Forty Creek Whisky, and Lot No. 40.' },
      { q: 'Where is Canadian whisky produced?', a: 'Canadian whisky is produced across Canada, including Ontario, Manitoba, Alberta, and Quebec.' },
      { q: 'What is blended Canadian whisky?', a: 'Blended Canadian whisky combines different whisky components to create a balanced taste.' },
      { q: 'What is the difference between rye whisky and Canadian whisky?', a: 'Rye whisky refers to whisky made with rye as a major ingredient, while Canadian whisky is a broader category using different grains.' },
      { q: 'What barrels are used for Canadian whisky?', a: 'Canadian whisky is commonly aged in oak barrels that add flavours like vanilla, caramel, and spice.' },
      { q: 'Why is Canadian whisky considered smooth?', a: 'It is considered smooth because of lighter grain blends, aging, and blending techniques.' },
      { q: 'Can Canadian whisky be used in cocktails?', a: 'Yes. It works well in cocktails such as Old Fashioned, Manhattan, Whisky Sour, and whisky highballs.' },
      { q: 'What is the best way to drink Canadian whisky?', a: 'It can be enjoyed neat, with water, over ice, or in cocktails.' },
      { q: 'What food pairs well with Canadian whisky?', a: 'It pairs well with smoked meats, grilled steak, cheese, dark chocolate, nuts, and caramel desserts.' },
      { q: 'What is Crown Royal famous for?', a: 'Crown Royal is famous for its smooth blended Canadian whisky and signature purple velvet bag packaging.' },
      { q: 'Is Canadian whisky popular worldwide?', a: 'Yes. Canadian whisky is exported globally and appreciated for its smooth style.' },
      { q: 'What is the difference between Canadian whisky and Scotch whisky?', a: 'Scotch is produced in Scotland and often uses malted barley, while Canadian whisky commonly uses blended grains.' },
      { q: 'How should Canadian whisky be stored?', a: 'Canadian whisky should be stored upright in a cool, dark place away from sunlight and temperature changes.' }
    ],
    shopLink: { to: `/products?cat=Whisky&sub=${encodeURIComponent('Canadian Whisky')}`, label: 'Shop Canadian Whisky' }
  }
};

export default knowledgeHub;
