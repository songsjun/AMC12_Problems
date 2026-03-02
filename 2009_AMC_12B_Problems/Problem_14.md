# 2009 AMC 12B Problem 14

> This problem is the same as [2009 AMC 10B #17](https://artofproblemsolving.com/wiki/index.php/2009_AMC_10B_Problems) and [2009 AMC 12B #14](https://artofproblemsolving.com/wiki/index.php/2009_AMC_12B_Problems).
## Problem
Five unit squares are arranged in the coordinate plane as shown, with the lower left corner at the origin. The slanted line, extending from (c,0) to (3,3), divides the entire region into two regions of equal area. What is c?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.2cm); defaultpen(linewidth(.8pt)+fontsize(8pt)); fill((2/3,0)--(3,3)--(3,1)--(2,1)--(2,0)--cycle,gray); xaxis("$x$",-0.5,4,EndArrow(HookHead,4)); yaxis("$y$",-0.5,4,EndArrow(4)); draw((0,1)--(3,1)--(3,3)--(2,3)--(2,0)); draw((1,0)--(1,2)--(3,2)); draw((2/3,0)--(3,3)); label("$(c,0)$",(2/3,0),S); label("$(3,3)$",(3,3),NE);
```


$\textbf{(A)}\ \frac12\qquad \textbf{(B)}\ \frac35\qquad \textbf{(C)}\ \frac23\qquad \textbf{(D)}\ \frac34\qquad \textbf{(E)}\ \frac45$
## Solutions
### Solution 1
For $c\geq 1.5$ the shaded area is at most 1.5, which is too little. Hence c<1.5, and therefore the point (2,1) is indeed inside the shaded part, as shown in the picture.

Then the area of the shaded part is one less than the area of the triangle with vertices (c,0), (3,0), and (3,3). The area of the entire triangle is $\frac{3(3-c)}2,$ therefore the area of the shaded part is $\frac{7-3c}{2}.$

The entire figure has area 5, hence we want the shaded part to have area $\frac 52.$ Solving for c, we get $c=\boxed{\frac 23}.$  The answer is $\mathrm{(C)} ($ what a coincidence ;) ).
### Solution 2
The unit square is of area 1, so the five unit squares have area 5.
Therefore the shaded space must occupy 2.5. The missing unit square is of area 1, and if reconstituted the original triangle would be of area 3.5.
It can then be inferred:
$$(3-c) * 3 = 7.$$

$$3-c=\frac{7}{3}, so 3-\frac{7}{3}=c.$$

$$3-\frac{7}{3} = \frac{9-7}{3} = \frac{2}{3}. \boxed{\mathrm{(C)}}.$$
### Solution 3
The shaded space of the object can become a triangle by adding a unit square to its bottom. This triangle has a base length of 3-c and a height of 3. The area of this triangle region is now (using the formula A=bh/2 for a triangle)(9-$3c$)/2. But, remember that we have to subtract the area of the extra unit square from this area to get the area of the shaded region.

If you add 3 unit squares to the top of the unshaded portion, the figure is now a right trapezoid. Using the formula for a trapezoid, you can derive that its area is (9+$3c$)/2. After you subtract the area of the 3 extra unit squares, we have derived the area of the unshaded portion.

Since these areas are both equal, we set them equal to each other and solve for c. (9-$3c$)/2 -1 = (9+$3c$)/2 -3.
c is now solved to be $\frac{2}{3}. \boxed{\mathrm{(C)}}.$

*~Solution by athens2016*
### Solution 4 (Brute Force)
We are looking for the area of the shaded region to be $\frac 52.$ We start by testing (A) $\frac 12.$ The area of the shaded region would be $\frac{(3-\frac 12)(3) }{2}-1=\frac$ {11}{4} when $c=\frac 12.$ This does not match our wanted answer.

We try (B) $\frac 35$ next. The area of the shaded region would be $\frac{(3-\frac 35)(3) }{2}-1=\frac$ {13}{5} when $c=\frac 35.$ This also does not match our desired answer.

We then try (C) $\frac 23.$ The area of the shaded region would be $\frac{(3-\frac 23)(3) }{2}-1=\frac$ {5}{2} when $c=\frac 23.$ Therefore, our answer is $\boxed{\mathrm{(C) \frac 23}}.$

~[https://artofproblemsolving.com/wiki/index.php/User:South South]
### Solution 5
Use the shoelace theorem to get the area of the unshaded portion in terms of a. Divide this area by the whole area which is 5. This fraction should be equal to 1/2. You can easily solve for the answer from there.
*~mewto*
## See Also
