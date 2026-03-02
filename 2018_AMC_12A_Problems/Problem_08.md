# 2018 AMC 12A Problem 8

> This problem is the same as [2018 AMC 10A #9](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_9) and [2018 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_8).
## Problem
All of the triangles in the diagram below are similar to isosceles triangle $ABC$, in which $AB=AC$. Each of the $7$ smallest triangles has area $1,$ and $\triangle ABC$ has area $40$. What is the area of trapezoid $DBCE$?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(5);
dot((0,0));
dot((60,0));
dot((50,10));
dot((10,10));
dot((30,30));
draw((0,0)--(60,0)--(50,10)--(30,30)--(10,10)--(0,0));
draw((10,10)--(50,10));
label("$B$",(0,0),SW);
label("$C$",(60,0),SE);
label("$E$",(50,10),E);
label("$D$",(10,10),W);
label("$A$",(30,30),N);
draw((10,10)--(15,15)--(20,10)--(25,15)--(30,10)--(35,15)--(40,10)--(45,15)--(50,10));
draw((15,15)--(45,15));
```

</asy>

$\textbf{(A) }   16   \qquad        \textbf{(B) }   18   \qquad    \textbf{(C) }   20   \qquad   \textbf{(D) }  22 \qquad  \textbf{(E) }   24$
## Solution 1
Let $x$ be the area of $ADE$. Note that $x$ is comprised of the $7$ small isosceles triangles and a triangle similar to $ADE$ with side length ratio $3:4$ (so an area ratio of $9:16$). Thus, we have

$$x=7+\dfrac{9}{16}x.$$

 This gives $x=16$, so the area of $DBCE=40-x=\boxed{(E) 24}$.
## Solution 2
Let the base length of the small triangle be $x$. Then, there is a triangle $ADE$ encompassing the 7 small triangles and sharing the top angle with a base length of $4x$. Because the area is proportional to the square of the side, let the base $BC$ be $\sqrt{40}x$. The ratio of the area of triangle $ADE$ to triangle $ABC$ is $\left(\frac{4x}{\sqrt{40}x}\right)^2 = \frac{16}{40}$. The problem says the area of triangle $ABC$ is $40$, so the area of triangle $ADE$ is $16$. So the area of trapezoid $DBCE$ is $40 - 16 = \boxed{24}$.
## Solution 3
Notice $\big[DBCE\big]=\big[ABC\big]-\big[ADE\big]$.
Let the base of the small triangles of area 1 be $x$, then the base length of $\Delta ADE=4x$. Notice, $\left(\frac{DE}{BC}\right)^2=\frac{1}{40}\implies \frac{x}{BC}=\frac{1}{\sqrt{40}}$, then $4x=\frac{4BC}{\sqrt{40}}\implies \big[ADE\big]=\left(\frac{4}{\sqrt{40}}\right)^2\cdot \big[ABC\big]=\frac{2}{5}\big[ABC\big]$
Thus, $\big[DBCE\big]=\big[ABC\big]-\big[ADE\big]=\big[ABC\big]\left(1-\frac{2}{5}\right)=\frac{3}{5}\cdot 40=\boxed{24}.$

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(5);
dot((0,0));
dot((60,0));
dot((50,10));
dot((10,10));
dot((30,30));
draw((0,0)--(60,0)--(50,10)--(30,30)--(10,10)--(0,0));
draw((10,10)--(50,10));
label("$B$",(0,0),SW);
label("$C$",(60,0),SE);
label("$E$",(50,10),E);
label("$D$",(10,10),W);
label("$A$",(30,30),N);
draw((10,10)--(15,15)--(20,10)--(25,15)--(30,10)--(35,15)--(40,10)--(45,15)--(50,10));
draw((15,15)--(45,15));
```

</asy>
## Solution 4
The area of $ADE$ is 16 times the area of the small triangle, as they are similar and their side ratio is $4:1$. Therefore the area of the trapezoid is $\boxed{24}$.
## Solution 5
You can see that we can create a "stack" of 5 triangles congruent to the 7 small triangles shown here, arranged in a row above those 7, whose total area would be 5. Similarly, we can create another row of 3, and finally 1 more at the top, as follows. We know this cumulative area will be $7+5+3+1=16$, so to find the area of such trapezoid $BCED$, we just take $\boxed{24}$, like so.
## Solution 6
The combined area of the small triangles is $7$, and from the fact that each small triangle has an area of $1$, we can deduce that the larger triangle above has an area of $9$ (as the sides of the triangles are in a proportion of $\frac{1}{3}$, so will their areas have a proportion that is the square of the proportion of their sides, or $\frac {1}{9}$). Thus, the combined area of the top triangle and the trapezoid immediately below is $7 + 9 = 16$. The area of trapezoid $BCED$ is thus the area of triangle $ABC-16 =\boxed{24}$.
## Solution 7
You can assume for the base of one of the smaller triangles to be $\frac{1}{a}$ and the height to be $2a$, giving an area of 1. The larger triangle above the 7 smaller ones then has base $\frac{3}{a}$ and height $6a$, giving it an area of $9$. Then the area of triangle $ADE$ is $16$ and $\boxed{24}$.
## Solution 8
You can construct another trapezoid directly above the one shown, with it's bottom length as the top length of the original. Its area would then be 9/16 of the original. Repeating this process infinitely gives us the sequence $\cdot\left(1+\left(\frac{9}{16}\right)+\left(\frac{9}{16}\right)^2+\left(\frac{9}{16}\right)^3\dots\right)$ . Using the infinite geometric series sum formula gives us $\cdot\left(\frac{1}{1-\frac{9}{16}}\right)=7\cdot\frac{16}{7}=16$. The triangle's area would thus be $\boxed{24}$.

*~ConcaveTriangle*
## Solution 9 (weird)
Note that the area of an isosceles triangle is equivalent to the square of its height. Using this information, the height of the smallest isosceles triangle is $1$, and thus its base is $2.$

Let $h$ be the height of the top triangle. We can set up a height-to-base similarity ratio, using the top triangle and $\triangle{ADE}$. The top triangle has a base of $\cdot{2}=6$, and $DE=4\cdot{2}=8.$ The height of $\triangle{ADE}$ is $h+1$, therefore our ratio is $\frac{h}{6}=\frac{h+1}{8}$, which yields $h=3$ as our answer.

To find the area of the trapezoid, we can take the area of $\triangle{ABC}$ and subtract the area of $\triangle{ADE},$ whose base is $8$ and height $3+1=4$. It follows that the area of $\triangle{ADE}=16$, and subtracting this from $40$ gives us $\boxed{\text{D) }24}$.

*~Benedict T (countmath1)*
## Solution 10 (Pretty standard)
Since each of the smallest triangles have area $1$, we have the combined area of them is $7$. Also, we know that every triangle is similar to big one. Therefore the triangle above the stack of triangles has area of $3^2 = 9$, because the side length is $3$, so we can just square it to find the area. Now to find the area of trapezoid $BCDE$ we can just do:

$$40-(9+7) = 40-16=\boxed{\text{E) }24}$$


*~jb2015007*
## Video Solution (HOW TO THINK CREATIVELY!)
https://youtu.be/lgkkomUwSs0

*~Education, the Study of Everything*
## Video Solutions
https://youtu.be/HJALwsbHZXc

*~Whiz*

https://youtu.be/ZiZVIMmo260

*~IceMatrix*

https://youtu.be/tq4rWskQDh8

*~savannahsolver*

https://youtu.be/4_x1sgcQCp4?t=2959

*~pi_is_3.14*
## See Also
