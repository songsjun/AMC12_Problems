# 2004 AMC 12B Problem 10

> This problem is the same as [2004 AMC 12B #10](https://artofproblemsolving.com/wiki/index.php/2004_AMC_12B_Problems) and [2004 AMC 10B #12](https://artofproblemsolving.com/wiki/index.php/2004_AMC_10B_Problems).
## Problem
An annulus is the region between two concentric circles. The concentric circles in the figure have radii b and c, with b>c. Let OX be a radius of the larger circle, let XZ be tangent to the smaller circle at Z, and let OY be the radius of the larger circle that contains Z. Let a=XZ, d=YZ, and e=XY. What is the area of the annulus?


> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1.5cm); defaultpen(0.8); real r1=1.5, r2=2.5; pair O=(0,0); path inner=Circle(O,r1), outer=Circle(O,r2); pair Y=(0,r2), Z=(0,r1), X=intersectionpoint( Z--(Z+(10,0)), outer ); filldraw(outer,lightgray,black); filldraw(inner,white,black); draw(X--O--Y); draw(Y--X--Z); label("$O$",O,SW); label("$X$",X,E); label("$Y$",Y,N); label("$Z$",Z,SW); label("$a$",X--Z,N); label("$b$",0.25*X,SE); label("$c$",O--Z,E); label("$d$",Y--Z,W); label("$e$",Y*0.65 + X*0.35,SW); defaultpen(0.5); dot(O); dot(X); dot(Z); dot(Y);
```


$$\mathrm{(A) \ } \pi a^2 \qquad \mathrm{(B) \ } \pi b^2 \qquad \mathrm{(C) \ } \pi c^2 \qquad \mathrm{(D) \ } \pi d^2 \qquad \mathrm{(E) \ } \pi e^2$$

## Solution
The area of the large circle is $\pib^2,$ the area of the small one is $\pic^2,$ hence the shaded area is $\pi(b^2-c^2).$

From the [Pythagorean Theorem](https://artofproblemsolving.com/wiki/index.php/Pythagorean_Theorem) for the right triangle OXZ we have $a^2 + c^2 = b^2,$ hence $b^2-c^2=a^2$ and thus the shaded area is $\boxed{\mathrm{(A)\ }\pi a^2}.$
## Solution 2
Set $c=0$, then the shaded area is just the area of a circle with radius a, which is $\boxed{\mathrm{(A)\ }\pi a^2}.$
## See also
