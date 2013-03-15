var sourceObject = {
  websiteTitle: 'Jeroen Ransijn',
  websiteSlogan: 'Creator of interfaces',
  my: {
    nestedItem: 'Bike n stuff',
    otherItem: 'This is the other item'
  },
  col: ['first', 'second', 'third']
};

var page = new Cats(sourceObject);

// no args means render all
// although might benefit from a virgin state, which could mean
// consecutive render calls will do a hash comparison and
// deep comparision of what has changed
// again this would benefit from Object.observe
page.render();

// This also means a Object.observe might be build in
page.source.websiteTitle = 'JSSR';
page.render('websiteTitle');

// this is the preffered method, 
// no confusion can arise about the state of source
page.render('websiteSlogan', 'Creator');