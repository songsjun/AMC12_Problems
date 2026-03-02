# 2021 AMC 12B Problem 11

## Problem
Triangle ABC has AB=13,BC=14 and AC=15. Let P be the point on $\overline{AC}$ such that PC=10. There are exactly two points D and E on line BP such that quadrilaterals ABCD and ABCE are trapezoids. What is the distance DE?

$\textbf{(A) }\frac{42}5 \qquad \textbf{(B) }6\sqrt2 \qquad \textbf{(C) }\frac{84}5\qquad \textbf{(D) }12\sqrt2 \qquad \textbf{(E) }18$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by Brendanb4321; edited by MRENTHUSIASM */ size(250); pair A = (5,12); pair B = (0,0); pair C = (14,0); pair P = 2/3*A+1/3*C; pair D = 3/2*P; pair E = 3*P; draw(A--B--C--cycle^^A--D^^C--E--B); dot("$A$",A,1.5*N); dot("$B$",B,1.5*SW); dot("$C$",C,1.5*SE); dot("$D$",D,1.5*N); dot("$P$",P,1.5*W); dot("$E$",E,1.5*N); label("$13$", (A+B)/2, 1.5*NW); label("$14$", (B+C)/2, 1.5*S); label("$5$", (A+P)/2, NE); label("$10$", (C+P)/2, NE);
```

*~Brendanb4321*
## Solution 1 (Analytic Geometry)
Toss on the Cartesian plane with A=(5, 12), B=(0, 0), and C=(14, 0). Then $\overline{AD}$\parallel$\overline{BC}, \overline{AB}$\parallel$\overline{CE}$ by the trapezoid condition, where D, E$\in\overline{BP}.$ Since PC=10, point P is $\tfrac{10}{15}=\tfrac{2}{3}$ of the way from C to A and is located at (8, 8). Thus line BP has equation y=x. Since $\overline{AD}$\parallel$\overline{BC}$ and $\overline{BC}$ is parallel to the ground, we know D has the same y-coordinate as A, except it'll also lie on the line y=x. Therefore, D=(12, 12). \, \blacksquare

To find the location of point E, we need to find the intersection of y=x with a line parallel to $\overline{AB}$ passing through C. The slope of this line is the same as the slope of $\overline{AB},$ or $\tfrac{12}{5},$ and has equation $y=\tfrac{12}{5}x-\tfrac{168}{5}.$ The intersection of this line with y=x is (24, 24). Therefore point E is located at (24, 24). \, \blacksquare

The distance DE is equal to the distance between (12, 12) and (24, 24), which is $\boxed{\textbf{(D) }12\sqrt2}.$
## Solution 2 (Stewart's Theorem)
Using Stewart's Theorem we find BP = $8\sqrt{2}.$ From the similar triangles BPA$\sim EPC$ and BPC$\sim DPA,$ we have

$$
DP = BP\cdot\frac{PA}{PC} = \frac{1}{2}BP
EP = BP\cdot\frac{PC}{PA} = 2BP
So, DE = \frac{3}{2}BP = \boxed{\textbf{(D) }12\sqrt2}.
$$

## Solution 3
Let x be the length PE. From the similar triangles BPA$\sim EPC$ and BPC$\sim DPA$ we have

$$
BP = \frac{PA}{PC}x = \frac12 x
PD = \frac{PA}{PC}BP = \frac14 x
$$

Therefore BD = DE = $\frac{3}{4}$x. Now extend line CD to the point Z on AE, forming parallelogram ZABC. As BD = DE we also have EZ = ZC = 13 so EC = 26.

We now use the Law of Cosines to find x (the length of PE):
$x^2 = EC^2 + PC^2 -2(EC)(PC)\cos{(PCE)} = 26^2 + 10^2 - 2\cdot 26\cdot 10\cos(\angle PCE)$
As $\angle PCE = \angle BAC,$ we have (by Law of Cosines on triangle BAC)
$\cos(\angle PCE) = \frac{13^2 + 15^2 - 14^2}{2\cdot 13\cdot 15}.$
Therefore

$$
\begin{align*} x^2 &= 26^2 + 10^2 - 2\cdot 26\cdot 10\cdot\frac{198}{2\cdot 13\cdot 15}\\ &= 776 - 264\\ &= 512 \end{align*}
$$

And x = $16\sqrt2.$ The answer is then $\frac34x = \boxed{\textbf{(D) }12\sqrt2}.$
## Solution 4 (Heron's Formula, Pythagorean Theorem, Similar Triangles)
Let the brackets denote areas. By Heron's Formula, we have

$$
\begin{align*} [ABC]&=\sqrt{\frac{13+14+15}{2}\left(\frac{13+14+15}{2}-13\right)\left(\frac{13+14+15}{2}-14\right)\left(\frac{13+14+15}{2}-15\right)} \\ &=\sqrt{21\left(21-13\right)\left(21-14\right)\left(21-15\right)} \\ &=\sqrt{21\left(8\right)\left(7\right)\left(6\right)} \\ &=\sqrt{\left(3\cdot7\right)\left(2^3\right)\left(7\right)\left(2\cdot3\right)} \\ &=2^2\cdot3\cdot7 \\ &=84. \end{align*}
$$

It follows that the height of ABCD is $\frac{2[ABC]}{14}=12.$

Next, we drop the altitudes $\overline{AF}$ and $\overline{DG}$ of ABCD. By the Pythagorean Theorem on right $\triangle AFB,$ we get BF=5. By the AA Similarity, we have $\triangle ADP\sim\triangle CBP,$ with the ratio of similitude 1:2. It follows that AD=7. Since ADGF is a rectangle, we get FG=AD=7. By the Pythagorean Theorem on right $\triangle DGB,$ we get BD=$12\sqrt2.$

By $\triangle ADP\sim\triangle CBP$ again, we get BP=$8\sqrt2$ and DP=$4\sqrt2.$ Also, by the AA Similarity, we have $\triangle ABP\sim\triangle CEP,$ with the ratio of similitude 1:2. It follows that EP=$16\sqrt2.$

Finally, we obtain DE=EP-DP=$\boxed{\textbf{(D) }12\sqrt2}.$

**Remark**

It is well known that the area of a $13\text{-}14\text{-}15$ triangle is 84.

*~MRENTHUSIASM*
## Solution 5 (Barycentric Coordinates)
(For those unfamiliar with barycentric coordinates, consider reading the barycentric coordinates article written by Evan Chen and Max Schindler here: https://artofproblemsolving.com/wiki/index.php/Resources_for_mathematics_competitions#Articles)

We can find P in barycentric coordinates as $\Bigr(\frac{2}{3},0,\frac{1}{3}\Bigr).$ We can then write $\overline{BP}$ as $x-2$z=0, where (x,y,z) defines a point in barycentric coordinates. We have $\overline{AD}$\parallel $\overline{BC}$ as y+$z=0$ and $\overline{CE}$\parallel $\overline{AB}$ as x+$y=0$. We can then compute D and E by intersecting lines:

$$
\begin{cases} x-2z=0\\ y+z=0\\ x+y+z=1 \end{cases}
$$

Which gives us D=$\left(1, -\frac{1}{2}, \frac{1}{2}\right).$ We can get E with:

$$
\begin{cases} x-2z=0\\ x+y=0\\ x+y+z=1 \end{cases}
$$

Which gives us E=(2, -2, 1). Then, finding the displacement vector, we have $\overrightarrow{ED}=\left(1,-\frac{3}{2},\frac{1}{2}\right).$ Using the barycentric distance formula:

$$
\begin{align*} \text{dist}(D,E)&=\sqrt{-a^2yx-b^2zx-c^2xy} \\ &=\sqrt{-14^2\Bigr(-\frac{3}{2}\Bigr)\Bigr(\frac{1}{2}\Bigr)-15^2\Bigr(1\Bigr)\Bigr(\frac{1}{2}\Bigr)-13^2\Bigr(-\frac{3}{2}\Bigr)\Bigr(\frac{1}{2}\Bigr)} \\ &=\boxed{\textbf{(D) }12\sqrt2}. \end{align*}
$$

## Video Solution by Punxsutawney Phil
https://YouTube.com/watch?v=yxt8-rUUosI&t=450s
## Video Solution by OmegaLearn (Properties of 13-14-15 Triangle)
https://youtu.be/mTcdKf5-FWg

*~pi_is_3.14*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=p4iCAZRUESs
## See Also
