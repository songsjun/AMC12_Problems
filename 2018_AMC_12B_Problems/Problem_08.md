# 2018 AMC 12B Problem 8

> This problem is the same as [2018 AMC 12B #8](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12B_Problems) and [2018 AMC 10B #12](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10B_Problems).
## Problem
Line segment $\overline{AB}$ is a diameter of a circle with $AB = 24$. Point $C$, not equal to $A$ or $B$, lies on the circle. As point $C$ moves around the circle, the centroid (center of mass) of $\triangle ABC$ traces out a closed curve missing two points. To the nearest positive integer, what is the area of the region bounded by this curve?

$\textbf{(A) } 25 \qquad \textbf{(B) } 38  \qquad \textbf{(C) } 50  \qquad \textbf{(D) } 63 \qquad \textbf{(E) } 75$
## Solution 1
By the Inscribed Angle Theorem, $\triangle ABC$ is a right triangle with $\angle C=90^{\circ}.$ So, its circumcenter is the midpoint of $\overline{AB},$ and its median from $C$ is half as long as $\overline{AB}.$ For each $\triangle ABC,$ let $O$ and $G$ be its circumcenter and centroid, respectively. It follows that $OA=OB=OC=12.$ In any triangle, since the centroid divides each median into parts in the ratio $2:1,$ with the centroid being twice as close to the midpoint of a side as it is to the opposite vertex, we have $OG=\frac13 OC=4.$

As shown below, $\triangle ABC_1$ and $\triangle ABC_2$ are two shapes of $\triangle ABC$ with centroids $G_1$ and $G_2,$ respectively:
<asy>
/* Made by MRENTHUSIASM */

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
pair O, A, B, C1, C2, G1, G2, M1, M2;
O = (0,0);
A = (-12,0);
B = (12,0);
C1 = (36/5,48/5);
C2 = (-96/17,-180/17);
G1 = O + 1/3 * C1;
G2 = O + 1/3 * C2;
M1 = (4,0);
M2 = (-4,0);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(Circle(O,12));
draw(Circle(O,4),red);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
dot("$O$", O, (3/5,-4/5), linewidth(4.5));
dot("$A$", A, W, linewidth(4.5));
dot("$B$", B, E, linewidth(4.5));
dot("$C_1$", C1, dir(C1), linewidth(4.5));
dot("$C_2$", C2, dir(C2), linewidth(4.5));
dot("$G_1$", G1, 1.5*E, linewidth(4.5));
dot("$G_2$", G2, 1.5*W, linewidth(4.5));
draw(A--B^^A--C1--B^^A--C2--B);
draw(O--C1^^O--C2);
```

dot(M1,red+linewidth(0.8),UnFill);
dot(M2,red+linewidth(0.8),UnFill);
</asy>
Therefore, point $G$ traces out a circle (missing two points) with the center $O$ and the radius $\overline{OG},$ as indicated in red. To the nearest positive integer, the area of the region bounded by the red curve is $\pi\cdot OG^2=16\pi\approx\boxed{\textbf{(C) } 50}.$

*~MRENTHUSIASM ~megacleverstarfish15*
## Solution 2
We assign coordinates. Let $A = (-12,0)$, $B = (12,0)$, and $C = (x,y)$ lie on the circle $x^2 +y^2 = 12^2$. Then, the centroid of $\triangle ABC$ is $G = \left(\frac{-12 + 12 + x}{3}, \frac{0 + 0 + y}{3}\right) = \left(\frac x3,\frac \right)$. Thus, $G$ traces out a circle with a radius $\frac13$ of the radius of the circle that point $C$ travels on. Thus, $G$ traces out a circle of radius $\frac{12}{3} = 4$, which has area $\pi\approx \boxed{\textbf{(C) } 50}$.
## Solution 3
First we can draw a few conclusions from the given information. Firstly we can see clearly that the distance from the centroid to the center of the circle will remain the same no matter $C$ is on the circle. Also we can see that because the two legs of every triangles will always originate on the diameter, using inscribed angle rules, we know that $\angle C = \frac{180^\circ}{2} = 90^\circ$. Now we know that all triangles $ABC$ will be a right triangle. We also know that the closed curve will simply be a circle with radius equal to the centroid of each triangle. We can now pick any arbitrary triangle, calculate its centroid, and the plug it in to the area formula. Using a $\circ-\circ-\circ$ triangle in conjunction with the properties of a centroid, we can quickly see that the length of the centroid is $4$ now we can plug it in to the area formula where we get $\pi\approx\boxed{\textbf{(C) } 50}$.
## Video Solution (HOW TO THINK CRITICALLY!!!)
https://youtu.be/CXOOhQVsOo8

*~Education, the Study of Everything*
## See Also
