# 2009 AMC 12A Problem 13

## Problem
A ship sails 10 miles in a straight line from A to B, turns through an angle between $45^{\circ}$ and $60^{\circ}$, and then sails another 20 miles to C. Let AC be measured in miles. Which of the following intervals contains $AC^2$?

> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(2mm); defaultpen(linewidth(.8pt)+fontsize(10pt)); dotfactor=4; pair B=(0,0), A=(-10,0), C=20*dir(50); draw(A--B--C); draw(A--C,linetype("4 4")); dot(A); dot(B); dot(C); label("$10$",midpoint(A--B),S); label("$20$",midpoint(B--C),SE); label("$A$",A,SW); label("$B$",B,SE); label("$C$",C,NE);
```


$\textbf{(A)}\ [400,500] \qquad \textbf{(B)}\ [500,600] \qquad \textbf{(C)}\ [600,700] \qquad \textbf{(D)}\ [700,800]$
$\textbf{(E)}\ [800,900]$
## Solution
### Answering the question
To answer the question we are asked, it is enough to compute $AC^2$ for two different angles, preferably for both extremes (45 and 60 degrees). You can use the law of cosines to do so.

Alternately, it is enough to compute $AC^2$ for one of the extreme angles. In case it falls inside one of the given intervals, we are done. In case it falls on the boundary between two options, we also have to argue whether our $AC^2$ is the minimal or the maximal possible value of $AC^2.$

Below we show a complete solution in which we also show that all possible values of $AC^2$ do indeed lie in the given interval.
### Complete solution
Let $C_1$ be the point the ship would reach if it turned $45^\circ,$ and $C_2$ the point it would reach if it turned $60^\circ.$ Obviously, $C_1$ is the furthest possible point from A, and $C_2$ is the closest possible point to A.

Hence the interval of possible values for $AC^2$ is [$AC_2^2,AC_1^2$].


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3mm); defaultpen(linewidth(.8pt)+fontsize(10pt)); dotfactor=4; pair B=(0,0), A=(-10,0), C1=20*dir(45), C2=20*dir(60); draw(A--B--C1); draw(A--C1,linetype("4 4")); draw(A--B--C2); draw(A--C2,linetype("4 4")); draw( arc(A, length(C1-A), 0, 55 ), dotted ); draw( arc(A, length(C2-A), 0, 55 ), dotted ); draw( arc(B, C1, C2) ); dot(A); dot(B); dot(C1); dot(C2); label("$10$",midpoint(A--B),S); label("$20$",midpoint(B--C1),SE); label("$A$",A,SW); label("$B$",B,SE); label("$C_1$",C1,NE); label("$C_2$",C2,N);
```


We can find $AC_1^2$ and $AC_2^2$ as follows:

Let $D_1$ and $D_2$ be the feet of the heights from $C_1$ and $C_2$ onto AB. The angles in the triangle $BD_1C_1$ are $45^\circ, 45^\circ,$ and $90^\circ,$ hence $BD_1=D_1C_1 = BC_1/\sqrt 2.$ Similarly, the angles in the triangle $BD_2C_2$ are $30^\circ, 60^\circ,$ and $90^\circ,$ hence $BD_2=BC_2 / 2$ and $D_2C_2=BC_2\sqrt 3/ 2$.


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3mm); defaultpen(linewidth(.8pt)+fontsize(10pt)); dotfactor=4; pair B=(0,0), A=(-10,0), C1=20*dir(45), C2=20*dir(60); draw(A--B--C1); draw(A--C1,linetype("4 4")); dot(A); dot(B); dot(C1); pair D1 = (C1.x,0); dot(D1); draw(B--D1--C1); label("$10$",midpoint(A--B),S); label("$20$",midpoint(B--C1),SE); label("$\sqrt 2$",midpoint(B--D1),S); label("$\sqrt 2$",midpoint(D1--C1),E); label("$A$",A,SW); label("$B$",B,SE); label("$C_1$",C1,NE); label("$D_1$",D1,S);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(3mm); defaultpen(linewidth(.8pt)+fontsize(10pt)); dotfactor=4; pair B=(0,0), A=(-10,0), C1=20*dir(45), C2=20*dir(60); draw(A--B--C2); draw(A--C2,linetype("4 4")); dot(A); dot(B); dot(C2); pair D2 = (C2.x,0); dot(D2); draw(B--D2--C2); label("$10$",midpoint(A--B),S); label("$20$",midpoint(B--C2),SE); label("$10$",midpoint(B--D2),S); label("$\sqrt 3$",midpoint(D2--C2),E); label("$A$",A,SW); label("$B$",B,SE); label("$C_2$",C2,NE); label("$D_2$",D2,S);
```


Hence we get:

$$AC_2^2 = AD_2^2 + D_2C_2^2 = 20^2 + (10\sqrt 3)^2 = 400 + 300 = 700$$


$$AC_1^2 = AD_1^2 + D_1C_1^2 = (10 + 20/\sqrt 2)^2 + (20\sqrt 2)^2 = 100 + 400/\sqrt 2 + 200 + 200 = 500 + 200\sqrt 2 < 500 + 200\cdot 1.5 = 800$$


Therefore for any valid C the value $AC^2$ is surely in the interval $\boxed{ \textbf{(D)}[700,800] }.$
### Alternate Solution
From the law of cosines, $500-400\cos120^\circ.$ This is essentially the same solution as above. The answer is $\boxed{\textbf{(D)}}.$
## See Also
