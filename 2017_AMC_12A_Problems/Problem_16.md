# 2017 AMC 12A Problem 16

## Problem
In the figure below, semicircles with centers at A and B and with radii 2 and 1, respectively, are drawn in the interior of, and sharing bases with, a semicircle with diameter JK. The two smaller semicircles are externally tangent to each other and internally tangent to the largest semicircle. A circle centered at P is drawn externally tangent to the two smaller semicircles and internally tangent to the largest semicircle. What is the radius of the circle centered at P?


> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm); draw(arc((0,0),3,0,180)); draw(arc((2,0),1,0,180)); draw(arc((-1,0),2,0,180)); draw((-3,0)--(3,0)); pair P = (-1,0)+(2+6/7)*dir(36.86989); draw(circle(P,6/7)); dot((-1,0)); dot((2,0)); dot(P);
```


$\textbf{(A)}\ \frac{3}{4} \qquad \textbf{(B)}\ \frac{6}{7} \qquad\textbf{(C)}\ \frac{\sqrt{3}}{2} \qquad\textbf{(D)}\ \frac{5}{8}\sqrt{2} \qquad\textbf{(E)}\ \frac{11}{12}$
## Solution 1
Connect the centers of the tangent circles! (call the center of the large circle C)


> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm); draw(arc((0,0),3,0,180)); draw(arc((2,0),1,0,180)); draw(arc((-1,0),2,0,180)); draw((-3,0)--(3,0)); pair P = (9/7,12/7); pair A = (-1,0); pair C = (0,0); pair B = (2,0); draw(circle(P,6/7)); dot((-1,0)); dot((2,0)); dot((0,0)); dot(P); draw((-1,0)--P); draw((2,0)--P); draw((0,0)--(9/5,12/5)); label("$A$",A,SW); label("$C$",C,S); label("$B$",B,SE); label("$P$",P,N);
```


Notice that we don't even need the circles anymore; thus, draw triangle $\Delta ABP$ with cevian PC:


> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm); draw((-1,0)--(2,0)); pair P = (9/7,12/7); pair A = (-1,0); pair C = (0,0); pair B = (2,0); dot((-1,0)); dot((2,0)); dot((0,0)); dot(P); draw((-1,0)--P); draw((2,0)--P); draw((0,0)--P); label("$A$",A,SW); label("$C$",C,S); label("$B$",B,SE); label("$P$",P,N);
```


and use [Stewart's Theorem](https://artofproblemsolving.com/wiki/index.php/Stewart's_Theorem):

$$AB \cdot AC \cdot BC + AB \cdot {CP}^2 = AC \cdot {BP}^2 + BC \cdot {AP}^2$$

From what we learned from the tangent circles, we have AB = 3, AC = 1, BC = 2, AP = 2 + r, BP = 1 + r, and CP = 3 - r, where r is the radius of the circle centered at P that we seek.

Thus:


$$
3 \cdot 1 \cdot 2 + 3 {\left(3-r\right)}^2 = 1 {\left(1+r\right)}^2 + 2 {\left(2+r\right)}^2
6 + 3\left(9 - 6r + r^2\right) = \left(1 + 2r + r^2\right) + 2\left(4 + 4r + r^2\right)
33 - 18r + 3r^2 = 9 + 10r + 3r^2
28r = 24
r = \boxed{\frac{6}{7}} \to \boxed{\textbf{(B)}}
$$

## Solution 2
> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm); draw(arc((0,0),3,0,180)); draw(arc((2,0),1,0,180)); draw(arc((-1,0),2,0,180)); draw((-3,0)--(3,0)); pair P = (9/7,12/7); draw(circle(P,6/7)); dot((-1,0)); dot((2,0)); dot((0,0)); dot(P); draw((-1,0)--P); draw((2,0)--P); draw((0,0)--(9/5,12/5));
```


Like the solution above, connecting the centers of the circles results in triangle $\Delta ABP$ with cevian PC. The two triangles $\Delta APC$ and $\Delta ABP$ share angle A, which means we can use [Law of Cosines](https://artofproblemsolving.com/wiki/index.php/Law_of_Cosines) to set up a system of 2 equations that solve for r respectively:

$(2 + r)^2 + 1^2 -2(2 + r)(1)\cos A = (3 - r)^2 (n$otice that the diameter of the largest semicircle is 6, so its radius is 3 and PC is 3 - r)

$$(2 + r)^2 + 3^2 - 2(2 + r)(3)\cos A = (r+1)^2$$

We can eliminate the extra variable of angle A by multiplying the first equation by 3 and subtracting the second from it. Then, expand to find r:

$$2(r^2 + 4r + 4) - 6 = 2r^2 - 20r + 26$$

$$8r + 2 = -20r + 26$$

$$28r = 24, so r = 6/7 \boxed{(B)}$$
## Solution 3
> [Asymptote diagram - not rendered in Markdown]

```asy
size(7.5cm); draw(arc((0,0),3,0,180)); draw(arc((2,0),1,0,180)); draw(arc((-1,0),2,0,180)); draw((-3,0)--(3,0)); pair P = (9/7,12/7); pair A = (-1,0); pair C = (0,0); pair B = (2,0); draw(circle(P,6/7)); dot((-1,0)); dot((2,0)); dot((0,0)); dot(P); draw((-1,0)--P); draw((-2.45,12/7)--P); draw((2.45,12/7)--P); draw((2,0)--P); draw((0,0)--(9/5,12/5)); label("$A$",A,SW); label("$C$",C,S); label("$B$",B,SE); label("$P$",P,N);
```


Let C be the center of the largest semicircle and r be the radius of $\circ P.$ We know that AC = 1,  CB = 2,  AP = r + 2,  BP = r + 1, and  CP = 3 - r. Notice that $\Delta ACP$ and $\Delta CBP$ are bounded by the same two parallel lines, so these triangles have the same heights. Because the bases of these two triangles (that have the same heights) differ by a factor of 2, the area of $\Delta CBP$ must be twice that of $\Delta ACP,$ since the area of a triangle is $\frac{1}{2} \text{Base} \cdot \text{Height}.$

Again, we don't need to look at the circle and the semicircles anymore; just focus on the triangles.


> [Asymptote diagram - not rendered in Markdown]

```asy
size(7.5cm); pair A = (-1,0); pair C = (0,0); pair B = (2,0); draw((-1,0)--(2,0)); pair P = (9/7,12/7); dot((-1,0)); dot((2,0)); dot((0,0)); dot(P); draw((-1,0)--P); draw((2,0)--P); draw((0,0)--P); label("$A$",A,SW); label("$C$",C,S); label("$B$",B,SE); label("$P$",P,N);
```


Let $A_1$ equal to the area of $\Delta ACP$ and $A_2$ equal to the area of $\Delta CBP.$
[Heron's Formula](https://artofproblemsolving.com/wiki/index.php/Heron's_Formula) states that the area of an triangle with sides a b and c is
$$\sqrt{s(s-a)(s-b)(s-c)}$$
where s, or the semiperimeter, is $\frac{a+b+c}{2}$

The semiperimeter $s_1$ of $\Delta ACP$ is $\frac{[(r + 2) + (3 - r) + 1]}{2} = \frac{6}{2} = 3$
Use Heron's Formula to obtain
$$A_1 = \sqrt{3(2)(3-2-r)(3-3+r)} = \sqrt{6r(1-r)} = \sqrt{6r-6r^2}$$

Using Heron's Formula again, find the area of $\Delta CBP$ with sides $r+1$, 2, and 3-r.


$$
s_2 = \frac{(r + 1) + 2 + (3 - r)}{2} = 3
A_2 = \sqrt{3(3-2)(3-1-r)(3-3+r)} = \sqrt{3(2r-r^2)} = \sqrt{6r-3r^2}
$$


Now,

$$
2 \cdot A_1 = A_2
2\sqrt{6r-6r^2} = \sqrt{6r-3r^2}
4(6r-6r^2) = 6r-3r^2
24r-24r^2 = 6r-3r^2
18r = 21r^2
r = \frac{18}{21} = \boxed{\frac{6}{7}} \to \boxed{\textbf{(B)}}
$$

## Solution 4
Let C, the center of the large semicircle, to be at (0, 0), and P to be at (h, k).


> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm); draw(arc((0,0),3,0,180)); draw(arc((2,0),1,0,180)); draw(arc((-1,0),2,0,180)); draw((-3,0)--(3,0)); pair P = (9/7,12/7); pair A = (-1,0); pair C = (0,0); pair B = (2,0); draw(circle(P,6/7)); dot((-1,0)); dot((2,0)); dot((0,0)); dot(P); draw((-1,0)--P); draw((2,0)--P); draw((0,0)--(9/5,12/5)); label("$A$",A,SW); label("$C$",C,S); label("$B$",B,SE); label("$P$",P,N);
```


Therefore A is at (-1, 0) and B is at (2, 0).

Let the radius of circle P be r.

Using Distance Formula, we get the following system of three equations:

$$h^2+k^2=(3-r)^2, (h+1)^2+k^2=(r+2)^2, (h-2)^2+k^2=(r+1)^2$$

By simplifying, we get

$$h^2+k^2=r^2-6r+9, h^2+2r+1+k^2=r^2+4r+4, h^2-4r+4+k^2=r^2+2r+1$$

By subtracting the first equation from the second and third equations, we get

$$8r=-4h+12, 10r=2h+6$$

which simplifies to

$$2r=3-h, 5r=h+3$$

When we add these two equations, we get

$$7r=6$$

$$So r = \boxed{\frac{6}{7}} \to \boxed{\textbf{(B)}} w^5$$
## Solution 5 (Inversion from [Circular Inversion](https://artofproblemsolving.com/wiki/index.php/Circular_Inversion))
Let $\Omega$ be a circle with radius of 6 and centered at the left corner of the semi-circle (O) with radius 3. Extend the three semicircles to full circles. Label the resulting four circles as shown in the diagram:


> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm); path circle1 = Circle((3, 0), 3); path circle2 = Circle((2, 0), 2); path circle3 = Circle((5, 0), 1); pair P = (2,0)+(2+6/7)*dir(36.86989); path circle4 = Circle(P, 6/7); draw(circle1); draw(circle2); draw(circle3); draw(circle4); draw((0, 0)--(6, 0)); dot((2,0)); dot((5,0)); dot(P); dot((3, 0)); dot(origin); path inversion = arc((0,0), 6, -30, 30); draw(inversion, dashed); label("$\Omega$", (6, 0) * dir(30), NE); label("$C_1$", (3, 0), N); label("$C_2$", (2, 0), N); label("$C_3$", (5, 0), N); label("$C_4$", P, N); label("$O$", origin, W);
```


$C_1$ has radius 3, $C_2$ has radius 2, and $C_3$ has radius 1. We want to find the radius of $C_4$.

We now invert the four circles. $C_1$ inverts to a line. Given that one point is on $\Omega,$ and all points on $\Omega$ invert to themselves, we know that the resulting line must intersect that intersection point. $C_2$ also inverts to a line. $C_2$ has radius 4, and since $\Omega$ has radius of 6, the resulting line must be $\frac{36}{4} = 9$ units away from O. $C_3$ inverts to a circle. By observing the diagram, we note that $C_3$''s center must be on $\overline{OC_3}$ and be between the two inverted lines, because $C_3$ is tangent to $C_1$ and $C_2$ (Remeber that tangency still holds in inverted diagrams). Therefore, we must have a circle with radius $\frac{3}{2}$ that is $\frac{15}{2}$ units from O.


> [Asymptote diagram - not rendered in Markdown]

```asy
size(10cm); path circle1 = Circle((3, 0), 3); path circle2 = Circle((2, 0), 2); path circle3 = Circle((5, 0), 1); pair P = (2,0)+(2+6/7)*dir(36.86989); path circle4 = Circle(P, 6/7); draw(circle1); draw(circle2); draw(circle3); draw(circle4); draw((0, 0)--(9, 0)); dot((2,0)); dot((5,0)); dot(P); dot((3, 0)); dot(origin); path inversion = arc((0,0), 6, -30, 30); draw(inversion, dashed); label("$\Omega$", (6, 0) * dir(30), NW); label("$C_1$", (3, 0), N); label("$C_2$", (2, 0), N); label("$C_3$", (5, 0), N); label("$C_4$", P, N); label("$O$", origin, W); draw((6, 3)--(6, -3)); draw((9, 3)--(9, -3)); draw(Circle((15/2, 0), 3/2)); label("$C_1'$", (6, 3), N); label("$C_2'$", (9, 3), N); label("$C_3'$", (15/2, 0), N); dot((15/2, 0));
```


Now, we invert $C_4$. Note that $C_4$ is tangent to the three other original circles. So, in the inversion, $C_4$' must be tangent to the two lines *and* $C_3$'. It is then quickly seen that $C_3$' and $C_4$' have the same radius: $\frac{3}{2}.$

Now, we can determine the radius of $C_4$ using the formula $r =\frac{k^2 \cdot r'}{\overline{OC_2}^2 - r'^2}.k^2 = 36,$ and r' = $\frac{3}{2}. \overline{OC}$ is just the distance from the center of the inverted circle to the center of inversion. The center of $C_4$' is 3 units above the center of $C_3$'. Since $\overline{OC_3'} = \frac{15}{2},$ we use Pythagoras to learn that $\overline{OC_4'}^2 = \left(\frac{15}{2}\right)^2 + 9.$ We do not take the square root because our relationship formula takes $\overline{OC_4'}^2.$

Therefore, we have: r = $\frac{36 \cdot \frac{3}{2}}{\left(\frac{15}{2}\right)^2 - \left(\frac{3}{2}\right)^2 + 9} = \frac{54}{9 \cdot 6 + 9} = \frac{6}{7} = \boxed{B}.$

Here is the diagram with $C_4$'.


> [Asymptote diagram - not rendered in Markdown]

```asy
size(10cm); path circle1 = Circle((3, 0), 3); path circle2 = Circle((2, 0), 2); path circle3 = Circle((5, 0), 1); pair P = (2,0)+(2+6/7)*dir(36.86989); path circle4 = Circle(P, 6/7); draw(circle1); draw(circle2); draw(circle3); draw(circle4); draw((0, 0)--(9, 0)); dot((2,0)); dot((5,0)); dot(P); dot((3, 0)); dot(origin); path inversion = arc((0,0), 6, -45, 45); draw(inversion, dashed); label("$\Omega$", (6, 0) * dir(45), NW); label("$C_1$", (3, 0), N); label("$C_2$", (2, 0), N); label("$C_3$", (5, 0), N); label("$C_4$", P, N); label("$O$", origin, W); draw((6, 4.5)--(6, -3)); draw((9, 4.5)--(9, -3)); draw(Circle((15/2, 0), 3/2)); label("$C_1'$", (6, -3), SW); label("$C_2'$", (9, -3), SE); label("$C_3'$", (15/2, 0), NE); dot((15/2, 0)); draw(Circle((15/2, 3), 3/2)); dot((15/2, 3)); label("$C_4'$", (15/2, 3), N); draw((15/2, 0)--(15/2, 3)); draw(rightanglemark(origin, (15/2, 0), (15/2, 3)));
```
## Solution 6 (Kissing Circles)
Draw the other half of the largest circle and proceed with [Descartes' Circle Formula](https://artofproblemsolving.com/wiki/index.php/Descartes'_Circle_Formula).

The curvatures of circles A,B,C, and P are $\frac{1}{2}, 1, -\frac{1}{3},$ and $\frac{1}{r},$ respectively.
## Video Solution by Punxsutawney Phil
https://www.youtube.com/watch?v=f_cdwEDlWXQ
## See Also
