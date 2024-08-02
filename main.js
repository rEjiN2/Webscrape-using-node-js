const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

async function scrapeSite() {
    const url = `https://www.offertag.in`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    $('.featured-item-container').each((i, elem) => {
        const title = $(elem).find('.deal-title h4').text().trim();
        const category = $(elem).find('.rightDealTag').last().text().trim();
        const image = $(elem).find('.dealImage').attr('data-src');
        const oldPrice = $(elem).find('.old-price span').text().replace('₹', '').replace(',', '').trim();
        const newPrice = $(elem).find('.new-price span').text().replace('₹', '').replace(',', '').trim();
        const discount = $(elem).find('.discount span').text().replace('%', '').replace('Off', '').trim();
        const link = $(elem).find('.shop-btn a').attr('data-alt-href');

        let subcategory = null;
        if (category.toLowerCase() === 'clothing') {
            const lowerTitle = title.toLowerCase();
            if (lowerTitle.includes('women') || lowerTitle.includes('womens')) {
                subcategory = 'Women';
            } else if (lowerTitle.includes('men') || lowerTitle.includes('mens')) {
                subcategory = 'Men';
            } else {
                subcategory = 'Men'; // Default to 'Men' if neither is found
            }
        }

        results.push({
            title,
            category,
            subcategory,
            image,
            oldPrice: parseFloat(oldPrice),
            price: parseFloat(newPrice),
            discount: parseFloat(discount),
            link
        });
    });

    return results;
}

app.get('/scrape', async (req, res) => {
    try {
        const deals = await scrapeSite();
        console.log(deals, "deals");
        console.log(deals.length, "length");
        res.json(deals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while scraping the site' });
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});