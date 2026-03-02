# 2021 AMC 12B Problem 8

> This problem is the same as [2021 AMC 10B #14](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10B_Problems#Problem_14) and [2021 AMC 12B #8](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12B_Problems#Problem_8).
## Problem
Three equally spaced parallel lines intersect a circle, creating three chords of lengths 38,38, and 34. What is the distance between two adjacent parallel lines?

$\textbf{(A) }5\frac12 \qquad \textbf{(B) }6 \qquad \textbf{(C) }6\frac12 \qquad \textbf{(D) }7 \qquad \textbf{(E) }7\frac12$
## Solution 1 (Pythagorean Theorem)
> [Asymptote diagram - not rendered in Markdown]

```asy
size(8cm); pair O = (0, 0), A = (0, 3), B = (0, 9), R = (19, 3), L = (17, 9); draw(O--A--B); draw(O--R); draw(O--L); label("$A$", A, NE); label("$B$", B, N); label("$R$", R, NE); label("$L$", L, NE); label("$O$", O, S); label("$d$", O--A, W); label("$2d$", A--B, W); label("$r$", O--R, S); label("$r$", O--L, NW); dot(O); dot(A); dot(B); dot(R); dot(L); draw(circle((0, 0), sqrt(370))); draw(-R -- (R.x, -R.y)); draw((-R.x, R.y) -- R); draw((-L.x, L.y) -- L);
```


Since two parallel chords have the same length (38), they must be equidistant from the center of the circle. Let the perpendicular distance of each chord from the center of the circle be d. Thus, the distance from the center of the circle to the chord of length 34 is

$$2d + d = 3d$$

and the distance between each of the chords is just $2d$. Let the radius of the circle be r. Drawing radii to the points where the lines intersect the circle, we create two different right triangles:

- One with base $\frac{38}{2}= 19,$ height d, and hypotenuse r  ($\triangle RAO$ on the diagram)

- Another with base $\frac{34}{2} = 17,$ height $3d$, and hypotenuse r  ($\triangle LBO$ on the diagram)

By the Pythagorean theorem, we can create the following system of equations:

$$19^2 + d^2 = r^2$$

$$17^2 + (2d + d)^2 = r^2$$

Solving, we find $d = 3$, so $2d=\boxed{\textbf{(B)}\ 6}.$

*~Joeya (Solution)*
*~Jamess2022 (burntTacos) (Diagram)*
*~lpieleanu (Minor Edits)*
## Solution 2 (Coordinates)
Because we know that the equation of a circle is $(x-a)^2 + (y-b)^2 = r^2$ where the center of the circle is (a, b) and the radius is r, we can find the equation of this circle by centering it on the origin. Doing this, we get that the equation is $x^2 + y^2 = r^2. Now,$ we can set the distance between the chords as $2d$ so the distance from the chord with length 38 to the diameter is d.

Therefore, the following points are on the circle as the y-axis splits the chord in half, that is where we get our x value:

(19, d)

(19, -d)

(17, -$3d$)

Now, we can plug one of the first two value in as well as the last one to get the following equations:

$$19^2 + d^2 = r^2$$

$$17^2 + (3d)^2 = r^2$$

Subtracting these two equations, we get $19^2 -17^2 =8d^2$ - therefore, we get $72 =$8d^2 $\rightarrowd^2 = 9 \rightarrowd = 3$. We want to find $2d = 6$ because that's the distance between two chords. So, our answer is $\boxed{B}.$

*~Tony_Li2007 ~minor edits Marshall_Huang*
## Solution 3 (Stewart's Theorem)
> [Asymptote diagram - not rendered in Markdown]

```asy
real r=sqrt(370); draw(circle((0, 0), r)); pair A = (-19, 3); pair B = (19, 3); draw(A--B); pair C = (-19, -3); pair D = (19, -3); draw(C--D); pair E = (-17, -9); pair F = (17, -9); draw(E--F); pair O = (0, 0); pair P = (0, -3); pair Q = (0, -9); draw(O--Q); draw(O--C); draw(O--D); draw(O--E); draw(O--F); label("$O$", O, N); label("$C$", C, SW); label("$D$", D, SE); label("$E$", E, SW); label("$F$", F, SE); label("$P$", P, SW); label("$Q$", Q, S);
```

If d is the requested distance, and r is the radius of the circle, Stewart's Theorem applied to $\triangle OCD$ with cevian \overleftrightarrow{OP} gives $19\cdot 38\cdot 19 + \tfrac{1}{2}d\cdot 38\cdot\tfrac{1}{2}$d=$19r^{2}+19r^{2}$. This simplifies to $13718+\tfrac{19}{2}d^{2}=38r^{2}$. Similarly, another round of Stewart's Theorem applied to $\triangle OEF$ with cevian \overleftrightarrow{OQ} gives $17\cdot 34\cdot 17 + \tfrac{3}{2}d\cdot 34\cdot\tfrac{3}{2}$d=$17r^{2}+17r^{2}$. This simplifies to $9826+\tfrac{153}{2}d^{2}=34r^{2}$. Dividing the top equation by 38 and the bottom equation by 34 results in the system of equations

$$
\begin{align*} 361+\tfrac{1}{4}d^{2} &= r^{2} \\ 289+\tfrac{9}{4}d^{2} &= r^{2} \\ \end{align*}
$$

By transitive, $361+\tfrac{1}{4}d^{2}=289+\tfrac{9}{4}d^{2}$. Therefore ($\tfrac{9}{4}-\tfrac{1}{4})d^{2}=361-289\rightarrow 2d^{2}=72\rightarrowd^{2}=36\rightarrowd=\boxed{\textbf{(B)} ~6}.$

*~Punxsutawney Phil*
## Video Solution (Super Fast. Just 1 min!)
https://youtu.be/145UJbG4aCQ

*~Education, the Study of Everything*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=VzwxbsuSQ80
## Video Solution by Punxsutawney Phil
https://youtu.be/yxt8-rUUosI

This is a private video
## Video Solution by OmegaLearn (Circular Geometry)
https://youtu.be/XNYq4ZMBtBU

*~pi_is_3.14*
## Video Solution by TheBeautyofMath
https://youtu.be/L1iW94Ue3eI?t=1118 (for AMC 10B)

https://youtu.be/kuZXQYHycdk?t=574 (for AMC 12B)

*~IceMatrix*
## Video Solution by Interstigation
https://youtu.be/lYxKkS252Og

*~Interstigation*
## See Also
