# Contributing

## Get in touch

You are very welcome to contribute to the Bancho.js project! Most of the library is done by now -- but there are always improvements to be done. Feel free to open issues and discuss any of that over the dedicated [Discord channel](https://discord.gg/ThePooN)!

## Set-up

The public documentation is for the end-users; I recommend you to generate the private documentation for development purposes with `npm run doc:dev` to begin with.  
To run the tests, you need to copy the example `config.json.example` file to `config.json` and edit your credentials. Execute them with `npm run test`.  
After that, feel free to assign yourself to any [issue](https://git.cartooncraft.fr/ThePooN/bancho.js/issues) and well... make magic happen!  
I'll also require you to pass the CI tests. The `irc` test requires you to set up the `IRC_USER`, `IRC_PASS`, `API_KEY` (osu! API key) and `USER_ID` (osu! user id) [secret variables in your project CI / CD settings](https://git.cartooncraft.fr/help/ci/variables/README#secret-variables), although I will be lenient on MRs not affecting the actual code on this test.

Feel free to create issues as well, and MR your work once you're finished.

## Testing & Examples

You're very welcomed to write test units for the tests you write, when possible. Providing examples for new features is a plus.  
Every examples and test units should always work at any commit in the project.

### Thanks for contributing! 💙💙💙