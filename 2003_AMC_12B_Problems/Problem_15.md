# 2003 AMC 12B Problem 15

> This problem is the same as [2003 AMC 12B #15](https://artofproblemsolving.com/wiki/index.php/2003_AMC_12B_Problems) and [2003 AMC 10B #23](https://artofproblemsolving.com/wiki/index.php/2003_AMC_10B_Problems).
## Problem
A regular octagon  ABCDEFGH  has an area of one square unit. What is the area of the rectangle  ABEF ?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm); defaultpen(linewidth(.8pt)+fontsize(8pt)); pair C=dir(22.5), B=dir(67.5), A=dir(112.5), H=dir(157.5), G=dir(202.5), F=dir(247.5), E=dir(292.5), D=dir(337.5); draw(A--B--C--D--E--F--G--H--cycle); label("$A$",A,NNW); label("$B$",B,NNE); label("$C$",C,ENE); label("$D$",D,ESE); label("$E$",E,SSE); label("$F$",F,SSW); label("$G$",G,WSW); label("$H$",H,WNW);
```


$\textbf{(A)}\ 1-\frac{\sqrt2}{2}\qquad\textbf{(B)}\ \frac{\sqrt2}{4}\qquad\textbf{(C)}\ \sqrt2-1\qquad\textbf{(D)}\ \frac{1}2\qquad\textbf{(E)}\ \frac{1+\sqrt2}{4}$
## Video Solution
https://www.youtube.com/watch?v=LREcUjK-56U&feature=youtu.be
## Solution 1
Here is an easy way to look at this, where p is the perimeter, and a is the [apothem](https://artofproblemsolving.com/wiki/index.php/apothem):

Area of Octagon:  $\frac{ap}{2}=1$ .

Area of Rectangle:  $\frac{p}{8}\times 2a=\dfrac{2ap}{8}=\frac{ap}{4}$ .

You can see from this that the octagon's area is twice as large as the rectangle's area is $\boxed{\textbf{(D)}\ \frac{1}{2}}.$
## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm); defaultpen(linewidth(.8pt)+fontsize(8pt)); pair C=dir(22.5), B=dir(67.5), A=dir(112.5), H=dir(157.5), G=dir(202.5), F=dir(247.5), E=dir(292.5), D=dir(337.5); draw(A--B--C--D--E--F--G--H--cycle); label("$A$",A,NNW); label("$B$",B,NNE); label("$C$",C,ENE); label("$D$",D,ESE); label("$E$",E,SSE); label("$F$",F,SSW); label("$G$",G,WSW); label("$H$",H,WNW); draw(A--E--F--B--C--G--H--D); draw(A--E--F--B--A,blue); draw(A--F--E--B--A,red);
```


Here is a less complicated way than that of the user below. If you draw a line segment from each vertex to the center of the octagon and draw the rectangle ABEF (in red), you can see that 2 of the triangles (in blue) share the same base and height with $\dfrac{1}{2}$ the rectangle. Therefore, the rectangle's area is the same as $2\cdot2$ of the 8 triangles, and is  $\boxed{\textbf{(D)}\ \frac{1}{2}}$ the area of the octagon.
## Solution 3
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm); defaultpen(linewidth(.8pt)+fontsize(8pt)); pair C=dir(22.5), B=dir(67.5), A=dir(112.5), H=dir(157.5), G=dir(202.5), F=dir(247.5), E=dir(292.5), D=dir(337.5); draw(A--B--C--D--E--F--G--H--cycle); label("$A$",A,NNW); label("$B$",B,NNE); label("$C$",C,ENE); label("$D$",D,ESE); label("$E$",E,SSE); label("$F$",F,SSW); label("$G$",G,WSW); label("$H$",H,WNW); draw(A--D--E--H--G--B--C--F);
```

Drawing lines AD, BG, CF, and EH, we can see that the octagon is comprised of 1 square, 4 rectangles, and 4 triangles. The triangles each are 45-45-90 triangles, and since their diagonal is length x, each of their sides is $\frac{\sqrt{2}}{2}$x. The area of the entire figure is, likewise, x^2 (the square)+$4x^2\frac{\sqrt{2}}{2} (t$he 4 rectangles) +$2\cdot(\frac{\sqrt{2}}{2}$x)^2 (the triangles), which simplifies to $2x^2+2\sqrt{2}x^2.$ The area of ABEF is just x($x+\frac{2\sqrt{2}}{2}$x), or $x^2 +x^2\sqrt{2},$ which we can see is the area of $\frac{ABCDEFGH}{2} = \boxed{\textbf{(D)}\ \frac{1}{2}}$ the area of the octagon.
## Solution 4
First, we are going to divide the diagram. Now we need to find the ratio of the area of the rectangle to the area of the trapezoid.


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1cm); defaultpen(linewidth(.8pt)+fontsize(8pt)); pair C=dir(22.5), B=dir(67.5), A=dir(112.5), H=dir(157.5), G=dir(202.5), F=dir(247.5), E=dir(292.5), D=dir(337.5); draw(A--B--C--D--E--F--G--H--cycle); label("$A$",A,NNW); label("$B$",B,NNE); label("$C$",C,ENE); label("$D$",D,ESE); label("$E$",E,SSE); label("$F$",F,SSW); label("$G$",G,WSW); label("$H$",H,WNW);draw(A--F);draw(B--E);draw(D--G);draw(C--H);
```


The area of a trapezoid is $\frac{b_1 + b_2}{2}$h
Note that the trapezoid is made out of 2 45-45-90 triangles and a rectangle, and that AH=FG=1. By realizing that, the area of the trapezoid is ($\frac{2+\sqrt{2}}{2})(\frac{\sqrt{2}}{2}).$ To make this product easier, note there is two trapezoids, so the new product is now this, ($\frac{2+\sqrt{2}}{2})(\sqrt{2}) = \sqrt{2} + 1$

Notice how the rectangle has side lengths $\sqrt{2}+1$ and 1, so it's area is also $\sqrt{2}+1.$

The ratio of the area of rectangle ABEF to the two trapezoids is 1:1, meaning they share half the area of the octagon. Since the area of the octagon is 1, $\therefore$ the area of the rectangle is $\boxed{\textbf{(D)}\ \frac{1}{2}}.$

*~ghfhgvghj10*
## See Also
