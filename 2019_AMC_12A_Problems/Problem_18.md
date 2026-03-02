# 2019 AMC 12A Problem 18

> This problem is the same as [2019 AMC 10A #21](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #18](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
A sphere with center O has radius 6. A triangle with sides of length 15, 15, and 24 is situated in space so that each of its sides is tangent to the sphere. What is the distance between O and the plane determined by the triangle?

$\textbf{(A) }2\sqrt{3}\qquad \textbf{(B) }4\qquad \textbf{(C) }3\sqrt{2}\qquad \textbf{(D) }2\sqrt{5}\qquad \textbf{(E) }5\qquad$
## Diagram
3D:

> [Asymptote diagram - not rendered in Markdown]

```asy
import graph3; import palette; size(200); currentprojection=orthographic(0,4,2); triple f(pair z) {return expi(z.x,z.y);} surface s=surface(f,(0,0),(pi,2pi),70,Spline); draw((0,-5/6,sqrt(5)/3)--(2,2/3,sqrt(5)/3)--(-2,2/3,sqrt(5)/3)--cycle); draw(s,mean(palette(s.map(zpart),Grayscale())),nolight); draw((2,2/3,sqrt(5)/3)--(-2,2/3,sqrt(5)/3));
```

Plane through triangle:

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(12,9)--(24,0)--cycle); draw((12,9)--(12,0), dashed); draw((11.5,0)--(11.5,0.5)--(12,0.5)); draw(circle((12,4),4)); draw((12,4)--(48/5, 36/5)); dot((12,4)); label("$15$", (6,9/2),NW); label("$15$", (18,9/2),NE); label("$24$", (12,-1),S); label("$r$",(54/5, 28/5), SW);
```
## Solutions
### Solution 1
The triangle is placed on the sphere so that its three sides are tangent to the sphere. The cross-section of the sphere created by the plane of the triangle is also the incircle of the triangle. To find the inradius, use $\text{area} = \text{inradius} \cdot \text{semiperimeter}.$ The area of the triangle can be found by drawing an altitude from the vertex between sides with length 15 to the midpoint of the side with length 24. The Pythagorean triple 9 - 12 - 15 allows us easily to determine that the base is 24 and the height is 9. The formula $\frac$ {$\text{base} \cdot \text{height}$} {2} can also be used to find the area of the triangle as 108, while the semiperimeter is simply $\frac$ {15 + 15 + 24} {2} = 27. After plugging into the equation, we thus get 108 = $\text{inradius} \cdot 27,$ so the inradius is 4. Now, let the distance between O and the triangle be x. Choose a point on the incircle and denote it by A. The distance OA is 6, because it is just the radius of the sphere. The distance from point A to the center of the incircle is 4, because it is the radius of the incircle. By using the Pythagorean Theorem, we thus find x = $\sqrt{6^2-4^2}=\sqrt{20} = \boxed{\textbf {(D) } 2 \sqrt {5}}.$
### Solution 2
Drop an altitude on the isosceles triangle. Let the resulting 3-4-5 right triangle ABC have AB=15 and BC=12. By special triangle, AC=9. Let r be the circle's radius. Let the circle's center be O and D be the closest point on AB to O.

Then, OD=r. Obviously, ODBC is a kite. Thus, BC=DB=12, and AD=15-DB=3. AO=AC-$r=9$-r. By Pythagoras, AD^2+OD^2=AO^2, so $3^2+r^2=(9-r)^2. The r^2$ terms cancel out, and $r=4$.

As before, using Pythagoras again, the distance is $\sqrt{6^2-4^2}=\boxed{\textbf{(D)}2\sqrt{5}}$

(Solution by BJHHar)
### Solution 3
As in Solution 1, we note that by the Pythagorean Theorem, the height of the triangle is 9, and that the three sides of the triangle are tangent to the sphere, so the circle in the cross-section of the sphere is the incenter of the triangle.

Recall that the inradius is the intersection of the angle bisectors. To find the inradius of the incircle, we use the Angle Bisector Theorem.

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(12,9)--(24,0)--cycle); dot((0,0)); dot((12,9)); dot((24,0)); dot((12,0)); label("$A$",(0,0),SW); label("$B$",(12,9),N); label("$C$",(24,0),SE); label("$D$",(12,-1/2),S); label("$I$",(12,4),SE); draw((12,9)--(12,0), dashed); draw(circle((12,4),4)); draw((0,0)--(216/13,216/39)); dot((12,4)); label("$15$", (6,9/2),NW); label("$12$", (6,-1),S);
```


$$
\begin{split}&\frac{AB}{BI}=\frac{AD}{DI} \\ \Rightarrow \ &\frac{15}{BI}=\frac{12}{DI} \\ \Rightarrow \ &\frac{BI}{5}=\frac{DI}{4}\end{split}
$$

Since we know that BI+DI (the height) is equal to 9, DI (the inradius) is 4.
From here, the problem can be solved in the same way as in Solution 1. The answer is $\boxed{\textbf {(D) } 2 \sqrt{5}}.$
### Solution 4 (similar triangles)
First, we label a few points:

> [Asymptote diagram - not rendered in Markdown]

```asy
draw((0,0)--(12,9)--(24,0)--cycle); draw((12,9)--(12,0), dashed); draw((11.5,0)--(11.5,0.5)--(12,0.5)); draw(circle((12,4),4)); draw((12,4)--(48/5, 36/5)); dot((12,4)); label("$15$", (6,9/2),NW); label("$15$", (18,9/2),NE); label("$r$",(54/5, 28/5), SW); label("$12$", (6,-1),S); label("$I$",(12,4),SE); label("$A$",(0,0),SW); label("$B$",(12,9),N); label("$C$",(24,0),SE); label("$D$",(12,-1/2),S); label("$E$",(48/5, 36/5),NW);
```


We have that $\triangle{BDC}$ is a 3-4-5 triangle, so, as in Solution 1, BD = 9.
From this, we know that $\overline{BI}=9-r.$
Since AB is tangent to circle I, we also know IEB is a right triangle. $\triangle{BIE}$ and $\triangle{BDA}$ share angle DBA, so $\triangle{BIE} \sim \triangle{BDA}$ since they have two equal angles.
Hence, by this similarity, $\dfrac{9-r}{5}=\dfrac{r}{4}.$ Cross-multiplying, we get 36-$4r=5r$, which gives $r=4$.
We now take another cross section of the sphere, perpendicular to the plane of the triangle.


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(circle((6,6),6)); draw((6,6)--(1.75735931,1.75735931)--(6,1.75735931)--cycle); dot((6,6)); dot((1.75735931,1.75735931)); dot((6,1.75735931)); label("$O$", (6,6),N); label("$6$", (3.87867965,3.87867965),NW); label("$4$", (3.87867965,1.75735931),SE);
```


Using the Pythagorean Theorem, we find that the distance from the center to the plane is $\boxed{\textbf {(D) } 2 \sqrt{5}}.$
## Community Discussion
https://artofproblemsolving.com/community/c3h1988124
## Video Solution 1
https://youtu.be/O2iayY57fVE

Education, the Study of Everything
## Video Solution 2
https://www.youtube.com/watch?v=P9-Snytos4o
## Video Solution 3 by Art of Problem Solving (Richard Rusczyk)
https://artofproblemsolving.com/videos/amc/2019amc10a/498
## See Also
