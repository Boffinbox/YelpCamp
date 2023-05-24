// accepts a function, and then executes that function
// if any errors are found, they are caught and passed
// to an error middleware in express

// intended for use with async express middleware

function tryCatchAsync(fn)
{
    return function (req, res, next)
    {
        fn(req, res, next).catch((e) => next(e));
    }
}

module.exports = tryCatchAsync;