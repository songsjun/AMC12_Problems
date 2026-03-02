# 2008 AMC 12A Problem 13

> This problem is the same as [2008 AMC 12A #13](https://artofproblemsolving.com/wiki/index.php/2008_AMC_12A_Problems) and [2008 AMC 10A #16](https://artofproblemsolving.com/wiki/index.php/2008_AMC_10A_Problems/Problem_16).
## Problem
Points A and B lie on a [circle](https://artofproblemsolving.com/wiki/index.php/circle) centered at O, and $\angle AOB = 60^\circ. A$ second circle is internally [tangent](https://artofproblemsolving.com/wiki/index.php/tangent) to the first and tangent to both $\overline{OA}$ and $\overline{OB}.$ What is the ratio of the area of the smaller circle to that of the larger circle?


$$\mathrm{(A)}\ \frac{1}{16}\qquad\mathrm{(B)}\ \frac{1}{9}\qquad\mathrm{(C)}\ \frac{1}{8}\qquad\mathrm{(D)}\ \frac{1}{6}\qquad\mathrm{(E)}\ \frac{1}{4}$$

## Solution 1
> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); defaultpen(fontsize(10)); pair $O=(0,0), A=(3,0), B=(3/2,3/2*3^.5), C=(3^.5,1), D=(3^.5,0), F=(1.5*3^.5,1.5), G=(2*3^.5,2)$; picture p = new picture; draw(p,Circle(O,0.2)); clip(p,O--C--A--cycle); add(p); draw(Circle(O,3)); dot(A); dot(B); dot(C); dot(O); draw(A--O--B); draw(O--C--D); draw(C--F); draw(D-(0.2,0)--D-(0.2,-0.2)--D-(0,-0.2)); draw(Circle(C,1)); label("$30^{\circ}$",(0.65,0.15),O); label("$r$",(C+D)/2,E); label("$2r$",(O+C)/2,NNE); label("$O$",O,SW); label("$r$",(C+F)/2,SE); label("$R$",(O+A)/2-(0,0.3),S); label("$P$",C,NW); label("$A$",(3,0), A); label("$B$"$,(3/2,3/2*3^.5), B)$; label("$C$"$,(1.5*3^.5,1.5), G)$; label("$Q$",D,SE);
```

Let P be the center of the small circle with radius r, and let Q be the point where the small circle is [tangent](https://artofproblemsolving.com/wiki/index.php/tangent) to OA. Also, let C be the point where the small circle is tangent to the big circle with radius R.

Then PQO is a right triangle. Angle POQ is 30 degrees because line OP bisects angle AOB (this can be proved by dropping a perpendicular line from P to line OB, letting their intersection be point S, and proving triangles PQO and PSO congruent), meaning that PQO is a 30-60-90 triangle. Therefore, OP=2PQ.

Since OP=OC-PC=OC-r=R-r, we have R-r=2PQ, or R-$r=2r$, or $\frac{1}{3}=\frac{r}{R}.$

Ratio of areas of circles is ratio of radii squared, so the answer is $\left(\frac{1}{3}\right)^2 = \frac{1}{9} \Rightarrow \boxed{B}$
## Solution 2
Like in Solution 1, let P be the center of the small circle with radius r, and let Q be the point where the small circle is [tangent](https://artofproblemsolving.com/wiki/index.php/tangent) to OA.

Let N be the tangency point of the two circles. As shown in Solution 1, POQ = 30 degrees, so angle NOA is also 30 degrees. Let the line tangent to the two circles at N intersect OA and OB at points C and D, respectively. Since line CD is tangent to circles O and P, it must be perpendicular to ON, meaning that angle ONC must be 90 degrees. Because angle NOA is 30 degrees, angle DCO is $180-30-90 = 60$ degrees. Angle DOC is also 60 degrees, so triangle DOC is equilateral.

Note that an equilateral triangle's incenter is also its centroid. This means the center of the inscribed circle is also the centroid. From properties of median lengths, the radius of the large circle is 3 times the radius of the small circle.

Then the ratio of areas will be $\frac{1}{3}$ squared, or $\frac{1}{9}\Rightarrow \boxed{\text{B}}.$
## See also
