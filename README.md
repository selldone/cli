[![npm version](https://img.shields.io/npm/v/selldone-cli.svg)](https://www.npmjs.com/package/selldone-cli)
![License](https://img.shields.io/github/license/selldone/cli.svg)


# Selldone CLI

🛍️ Go to the [**Full Storefront Project ▶**](https://github.com/selldone/storefront)

**⚡ Update Selldone CLI everytime you start using it! We have been updating it frequently every day.**
```shell
npm update -g selldone-cli
```

## Introduction

Welcome to the documentation for `selldone cli`, a command-line tool designed for seamless deployment of custom
storefront layouts for Selldone users. Selldone, accessible at [Selldone.com](https://www.selldone.com), is a
comprehensive e-commerce platform that empowers businesses and individual entrepreneurs to create, manage, and grow
their online presence effortlessly.


![Selldone Business OS Dev Kit](_docs/images/dev-kit.jpg)


### What is Selldone?

Selldone is an innovative e-commerce solution that offers a wide range of features to facilitate online store
management, sales, marketing, and much more. It provides a user-friendly interface and powerful tools to create a unique
and efficient online shopping experience.

### What is a Layout?

In the context of Selldone, a Layout refers to a custom storefront design. It allows users to personalize their online
shop's appearance and functionality, creating a unique brand experience for their customers. To get started with a fully
customizable storefront project, 🛍️ Go to the [**Full Storefront Project ▶**](https://github.com/selldone/storefront).

## Using Selldone CLI

`Selldone CLI` is an essential tool for developers looking to integrate their custom Layouts into the Selldone platform.
This tool facilitates the process of building, packaging, and deploying your storefront designs onto the Selldone
platform.

### Prerequisites

Before using `Selldone CLI`, ensure that you have Node.js installed on your system. The tool is designed to run on Node.js
and requires a basic understanding of JavaScript and command-line operations.

### Installation

```shell
npm install -g selldone-cli
```
or install locally: `npm install selldone-cli --save-dev` or `yarn add selldone-cli --dev`

### Local installation (Dev mode)

```shell
npm uninstall -g selldone-cli
npm install -g .
```

### Usage

[![Watch the video](https://img.youtube.com/vi/UBwjxznQz0U/maxresdefault.jpg)](https://youtu.be/UBwjxznQz0U)


To run `selldone`, navigate to the directory containing your Vue project and execute it:

```bash
selldone
```

![Run selldone cli screenshot](_docs/images/run-selldone-cli.png)


#### Success deploy message

![Success deploy message](_docs/images/success-deploy-message.png)

The script will guide you through the process of deploying your custom Layout. Follow the prompts to authenticate,
build, and upload your project to Selldone.

## Features

- **Authentication**: Securely log in to your Selldone account via OAuth2.
- **Build and Zip**: Automatically build your project and package it into a zip file.
- **Upload**: Seamlessly upload your zip file to the Selldone platform.
- **Version Control**: Ensure that each version of your Layout is unique and properly managed.


## Publish Package

URL: https://www.npmjs.com/package/selldone-cli

```shell
npm publish
```

## Contributing

Contributions to `Selldone CLI` are welcome! If you have suggestions, improvements, or bug fixes, feel free to fork the
repository, make changes, and submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.


---

Enjoy building and deploying your custom storefronts with Selldone!

---

For more information about customizing your Selldone storefront, visit
the [Full Storefront Project](https://github.com/selldone/storefront).

Happy coding! 🎊