## Inertia

- Inertia.js components should be placed in the ___SINGLE_BACKTICK___<?php echo e($assist->inertia()->pagesDirectory()); ?>___SINGLE_BACKTICK___ directory unless specified differently in the JS bundler (___SINGLE_BACKTICK___vite.config.js___SINGLE_BACKTICK___).
- Use ___SINGLE_BACKTICK___Inertia::render()___SINGLE_BACKTICK___ for server-side routing instead of traditional Blade views.
- Use the ___SINGLE_BACKTICK___search-docs___SINGLE_BACKTICK___ tool for accurate guidance on all things Inertia.

<code-snippet name="Inertia Render Example" lang="php">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>
<?php /**PATH /home/malingi/Projects/Mobiwave/imani-cms/imani-laravel/storage/framework/views/de7ec753cc5d9b24700ca2edd9e99d54.blade.php ENDPATH**/ ?>