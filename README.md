# SecureEdit - AES/openssl compatible encrypted text editor

Create and edit aes encrypted text files in a editor like fashion instead of command line openssl. 


## Installation

Download latest version from [Releases page](../../releases/latest). Enjoy.

## Usage

Following operations are supported:
* creating and saving new encrypted file
* opening existing encrypted file
* modifying and saving encrypted file

SecureEdit is fully compatible (two way interchangeable) with openssl encrypted files:

Command line decrypt:

```openssl enc -d -aes-256-cbc -in my.secret```

Command line encrypt:
```openssl enc -aes-256-cbc -salt -in my.secret.txt -out my.secret```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

* 1.0.0 Initial version

## License
