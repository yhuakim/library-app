const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Book = require('../models/book');
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['images/jpeg', 'images/png', 'images/gif'];
const Author = require('../models/author');
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

//All Books route
router.get('/', (req, res) => {
    res.send('All Books')
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
});

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename: null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.name),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })

    try {
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`);
        res.redirect('books')
    } catch {
        renderNewPage(res, book, hasError=true)
    }
});

//Show Book
router.get('/:id', async (req, res) => {

    try {
        const author = await Author.findById(req.params,id);
        const books = await Author.find({ author: author.id }).limit(6).exec();
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch (e) {
        res.redirect('/')
    }
})

//Edit Book
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
        
    } catch (e) {
        res.redirect('/authors')
    }
} )

//Update Book
router.put('/:id', async (req, res) => {
    let author

    try {
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`);
    } catch {
        if(author == null) {
            res.redirect('/')
        } else {
            res.render('books/edit', {
                author: author,
                errorMessage: 'Error updating book'
            })
        }
    }
} )

//Delete Book
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect('/authors');
    } catch {
        if(author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`);
        }
    }
} )

async function renderNewPage(res, book, hasError=false) {
    try {
        const authors = await Author.find({});
        const params = {
            authors,
            book
        }
        if(hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params)
    } catch (e) {
        res.redirect('/books')
    }
}

module.exports = router;