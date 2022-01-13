# Web game editor

Place div elements on a web page to make screens for your game.

## How to use

Copy the editor.js file into the directory where you want to make web pages.

Then create a CSS file `style.css` there like this:
```
.blue {
    background-color: blue;
}

.red {
    background-color: red;
}
```

Finally create a HTML file like this:

```
<!DOCTYPE html>
<html>
    <head>
        <script src="editor.js"></script>
        <link href="style.css" rel="stylesheet">
    </head>

    <body>
    </body>
</html>
```

* The `<script src="editor.js">` tag loads the editor that starts itself after loading.
* The `<link href="style.css" rel="stylesheet">` loads your styles so you can use them on the page.

Right-click on the page to see editor menu. There you can add div elements or save the page.

You can drag each div element around by its center or resize one by dragging on its right bottom corner.

Right-click on a div element to change its style class (eg. "blue" or "red" in above example), or to add elements inside it.
