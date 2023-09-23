# SecureEdit - AES/openssl compatible encrypted text editor

Create and edit aes encrypted text files in a editor like fashion instead of command line openssl. Exclusively for MacOs, Windows and Linux users.

Key Features:
* Multiplatform (MacOs, Windows, Linux)
* Hardened encryption using Advanced Encryption Standard (AES) with 256-bit key length in Cipher Block Chaining mode (AES256-CBC), same as in the Microsoft Apps Suite [AES256-CBC support for Microsoft 365](https://learn.microsoft.com/en-us/purview/technical-reference-details-about-encryption#aes256-cbc-support-for-microsoft-365)
* Network secure, 100% local. No data is transfered over network.
* Fast and simple, only plain text is supported
* Interoperability by design, compatible with other implementations of aes-256-cbc, no vendor lock.
* Daily used in IT community, fully maintained.


## Installation

Download latest version from [Releases page](../../releases/latest). Enjoy.

## Usage

Following operations are supported:
* creating and saving new encrypted file
* opening existing encrypted file
* modifying and saving encrypted file
* searching/replacing file contents

## Open and fully interoperable

SecureEdit is fully compatible (two way interchangeable) with openssl `aes 256 cbc` encrypted files:

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
* 1.0.11 Stabilization tweaks, docs update
* 1.0.9 Search & Replace added
* 1.0.6 Minor bugfixing
* 1.0.0 Initial version

## License
