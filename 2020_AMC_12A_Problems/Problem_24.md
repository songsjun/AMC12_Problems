# 2020 AMC 12A Problem 24

## Problem
Suppose that $\triangle{ABC}$ is an equilateral triangle of side length s, with the property that there is a unique point P inside the triangle such that AP=1, BP=$\sqrt{3},$ and CP=2. What is s?

$\textbf{(A) } 1+\sqrt{2} \qquad \textbf{(B) } \sqrt{7} \qquad \textbf{(C) } \frac{8}{3} \qquad \textbf{(D) } \sqrt{5+\sqrt{5}} \qquad \textbf{(E) } 2\sqrt{2}$
## Solution 1 (Rotations)
### Solution 1(a)
We begin by rotating $\triangle{ APB}$ counterclockwise by $60^{\circ}$ about A, such that P$\mapsto Q$ and B$\mapsto C.$ We see that $\triangle{ APQ}$ is equilateral with side length 1, meaning that $\angle APQ = 60^{\circ}.$ We also see that $\triangle{CPQ}$ is a 30-60-90 right triangle, meaning that $\angle CPQ= 60^{\circ}.$ Thus, by adding the two together, we see that $\angle APC = 120^{\circ}.$

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); pen p = fontsize(10pt)+gray+0.5; pen q = fontsize(13pt); pair A,B,C,D,P,Q; real s=sqrt(7); B=origin; A=s*dir(60); C=s*right; P=IP(CR(A,1),CR(C,2)); Q=rotate(60,A)*P; draw(A--B--C--A, black+0.8); draw(A--P--B^^P--C^^A--Q--C, p); draw(P--Q, p+dashed); //draw(A--A+C--C, p); label("$A$", A, up, q); label("$B$", B, 0.5*(B-P), q); label("$C$", C, 0.5*(C-P), q); label("$P$", P, dir(180), q); label("$Q$", Q, 0.25*(Q-B), q); label("$\sqrt{3}$",B--P, right, p); label("$2$",C--P, 2*left, p); label("$1$",A--P, 1.5**dir(-10), p); label("$1$", A--Q, dir(250), p); label("$1$",P--Q, down, p); label("$\sqrt{3}$",C--Q, right, p);
```

We can now use the law of cosines as following:

$$
\begin{align*} s^2 &= (AP)^2 + (CP)^2 - 2\cdot AP\cdot CP\cdot \cos{\angle{APC}} \\ &= 1 + 4 - 2\cdot 1\cdot 2\cdot \cos{120^{\circ}} \\ &= 5 - 4\left(-\frac{1}{2}\right) \\ &= 7, \end{align*}
$$

giving us that s = $\boxed{ \sqrt{7} \ \textbf{(B)}}.$

*~ciceronii*
### Solution 1(b)
Rotate $\triangle CPA$ counterclockwise $60^\circ$ around point C to $\triangle CQB.$ Then CP=CQ, $\angle PCQ=60^\circ,$ so $\triangle CPQ$ is an equilateral triangle.

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); pen p = fontsize(10pt)+gray+0.4; pen q = fontsize(13pt); pair A,B,C,D,P,Q; real s=sqrt(7); A=origin; B=s*right; C=s*dir(60); P=IP(CR(A,1),CR(C,2)); Q=rotate(60,C)*P; draw(A--B--C--A, black+0.8); draw(A--P--B^^P--C, p); draw(B--Q--C^^P--Q, p+dashed); label("$A$", A, A-P, q); label("$B$", B, B-P, q); label("$C$", C, up, q); label("$P$", P, dir(140), q); label("$Q$", Q, 0.25*(Q-P), q); label("$\sqrt{3}$",P--B, dir(60), p); label("$2$",C--P, 2*left, p); label("$1$",A--P, up, p); label("$1$", B--Q, dir(-30), p); label("$2$",P--Q, down, p); label("$2$",C--Q, dir(45), p);
```

Note that $\triangle PQB$ is a $30^\circ-60^\circ-90^\circ$ triangle, hence $\angle BPQ=30^\circ,$ and $\angle BPC=90^\circ,$ so $BC^2=PC^2+PB^2=2^2+3=7$, and the answer is $\boxed{\textbf{(B) } \sqrt{7}}.$

*~szhangmath*
### Solution 1(c)
Rotate $\triangle BPC$ counterclockwise by $60^\circ$ around point B to $\triangle BQA.$ Then BP=BQ, and $\angle PBQ=60^\circ,$ so $\triangle BPQ$ is an equilateral triangle.

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200); pen p = fontsize(10pt)+gray+0.4; pen q = fontsize(13pt); pair A,B,C,D,P,Q,R,X,Y,Z; real s=sqrt(7); C=origin; A=s*right; B=s*dir(60); P=IP(CR(A,1),CR(C,2)); Q=rotate(60,B)*P; draw(A--B--C--A, black+0.8); draw(A--P--B^^P--C, p); draw(B--Q--A^^P--Q, p+dashed); label("$A$", A, A-P, q); label("$B$", B, B-P, q); label("$C$", C, 0.6*(C-P), q); label("$P$", P, dir(250), q); label("$Q$", Q, 0.25*(Q-P), q); label("$\sqrt{3}$",B--Q, dir(60), p); label("$\sqrt{3}$",P--B, dir(210), p); label("$\sqrt{3}$",P--Q, dir(135), p); label("$2$",P--C, dir(120), p); label("$2$",A--Q, dir(-20), p); label("$1$",A--P, dir(210), p);
```

Note that $\triangle QAP$ is a $30^\circ-60^\circ-90^\circ$ triangle, hence $\angle PQA=30^\circ,$ and $\angle BQA=90^\circ,$ so $AB^2=PQ^2+AQ^2=2^2+3=7$, and the answer is $\boxed{\textbf{(B) } \sqrt{7}}.$
## Solution 2 (Intuition)
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(1inch); pen p = fontsize(10pt); dot((0.756,0.655)); dot((1.512,1.309)); dot((1.701,0.327)); pair A = origin, B = (1.323,2.291), C = (2.646,0), P = (0.756,0.655), Q = (1.512,1.309), R = (1.701,0.327); draw((0,0)--(1.323,2.291)--(2.646,0)--cycle); label("$A$", (0,0), SW, p); label("$C$", (2.646,0), SE, p); label("$B$", (1.323,2.291), N, p); label("$P'$", (0.756,0.655), NW, p); label("$1$", (2.174,0.164), N, p); label("$1$", (1.228,0.491), N, p); D(A--P, red); D(B--Q, red); D(C--R, red); D(P--Q--R--cycle, blue); D(B--P, magenta);
```


Suppose that triangle ABC had three segments of length 2, emanating from each of its vertices, making equal angles with each of its sides, and going into its interior. Suppose each of these segments intersected the segment clockwise to it precisely at its other endpoint and inside ABC (as pictured in the diagram above). Clearly s > 2 and the triangle defined by these intersection points will be equilateral (pictured by the blue segments).

Take this equilateral triangle to have side length 1. The portions of each segment outside this triangle (in red) have length 1. Take P' to be the intersection of the segments emanating from A and C. By Law of Cosines, BP' = $\sqrt{1 + 1 - 2\cos{120^\circ}} = \sqrt{3}.$ So, P' actually satisfies the conditions of the problem, and we can obtain again by Law of Cosines s = $\sqrt{4 + 1 - 4\cos{120^\circ}} = \boxed{\textbf{(B)} \sqrt{7}}.$

*~hnkevin42*
## Solution 3 (Answer Choices)
> [Asymptote diagram - not rendered in Markdown]

```asy
unitsize(0.4inch); pen p = fontsize(10pt); draw((0,0)--(4,5.65)--(8,0)--cycle); label("$A$", (4,5.65), N, p); label("$C$", (8,0), SE, p); label("$B$", (0,0), SW, p); label("$P$", (3.5,3.5), E, p); label("$E$", (2.8191,3.982), NW, p); label("$F$", (4.848,4.452), NE, p); label("$G$", (3.5,0), down, p); draw((0,0)--(3.5,3.5)); label("$\sqrt{3}$",(0,0)--(3.5,3.5), SE,p); draw((8,0)--(3.5,3.5)); label("$2$",(8,0)--(3.5,3.5), SW,p); draw((4,5.65)--(3.5,3.5)); label("$1$",(4,5.65)--(3.5,3.5), E,p); draw((3.5,3.5)--(2.8191,3.982)); draw((3.5,3.5)--(4.848,4.452)); draw((3.5,3.5)--(3.5,0));
```


We begin by dropping altitudes from point P down to all three sides of the triangle as shown above. We can therefore make equations regarding the areas of triangles $\triangle{APC}, \triangle{APB},$ and $\triangle{BPC}.$ Let s be the side of the equilateral triangle, we use the Heron's formula:

$\triangle{APC} = \frac{s\cdot PF}{2} = \sqrt{\frac{s+3}{2}\left(\frac{s+3}{2}-s\right)\left(\frac{s+3}{2}-1\right)\left(\frac{s+3}{2}-2\right)}$
$$\implies PF = \frac{\sqrt{10s^2-s^4-9}}{2s}$$

Similarly, we obtain:


$$
PE = \frac{\sqrt{8s^2-s^4-4}}{2s}
PG = \frac{\sqrt{14s^2-s^4-1}}{2s}
$$


By Viviani's theorem,

$$
\frac{\sqrt{10s^2-s^4-9}}{2s}+\frac{\sqrt{8s^2-s^4-4}}{2s}+\frac{\sqrt{14s^2-s^4-1}}{2s} = \frac{\sqrt{3}}{2}s
\sqrt{10s^2-s^4-9}+\sqrt{8s^2-s^4-4}+\sqrt{14s^2-s^4-1} = \sqrt{3}s^2
$$


Note that from now on, the algebra will get extremely ugly and almost impossible to do by hand within the time frame. However, we do see that it's extremely easy to check the answer choices with the equation in this form. Testing s = $\sqrt{7},$ We obtain $7\sqrt{3}$ on both sides, revealing that our answer is in fact $\boxed{\textbf{(B) } \sqrt{7}}$

*~siluweston*
*~edits by aopspandy*
## Solution 4 (Area)
Instead of directly finding the side length of the equilateral triangle, we instead find the area and use it to find the side length.
Begin by reflecting P over each of the sides. Label these reflected points P', P*, P*'. Connect these points to the vertices of the equilateral triangle, as well as to each other.


> [Asymptote diagram - not rendered in Markdown]

```asy
size(300); draw((0,3.5)--(4,9.15)--(8,3.5)--cycle); label("$A$", (4,9.15), N, p = fontsize(10pt)); label("$C$", (8,3.5), SE, p = fontsize(10pt)); label("$B$", (0,3.5), SW, p = fontsize(10pt)); label("$P$", (3.5,7), NW, p = fontsize(10pt)); draw((0,3.5)--(3.5,7)); draw((8,3.5)--(3.5,7)); draw((4,9.15)--(3.5,7)); label("$P'$", (3.5, 0), S, p = fontsize(10pt)); draw((8,3.5)--(3.5,0)); draw((0,3.5)--(3.5,0)); label("$P*$",(6,8.5), NE, p = fontsize(10pt)); draw((4,9.15)--(6,8.5)); draw((8,3.5)--(6,8.5)); label("$P*'$",(2.25,8), NW, p = fontsize(10pt)); draw((0,3.5)--(2.25,8)); draw((4,9.15)--(2.25,8)); draw((3.5,0)--(6,8.5)--(2.25,8)--cycle);
```


Observe that the area of the equilateral triangle ABC is half that of the hexagon AP*CP'BP*'.

Note that AP=AP*=AP**. The same goes for the other vertices. This means that AP*P** is isosceles. Using either the Law of Cosines or simply observing that AP*P** is comprised of two 30-60-90 triangles, we find that P*P**= $\sqrt{3}.$ Similarly (pun intended), P'P**=3 and P'P*=$2\sqrt{3}.$ Using the previous observation that AP*P** is two 30-60-90 triangles (as are the others) we find the areas of AP*P* to be $\frac{\sqrt{3}}{4}.$ Again, using similarity we find the area of BP'P*' to be $\frac{3\sqrt{3}}{4}$ and the area of CP'P* to be $\sqrt{3}.$

Next, observe that P'P*P*' is a 30-60-90 right triangle. This right triangle therefore has an area of $\frac{3\sqrt{3}}{2}.$

Adding these areas together, we get the area of the hexagon as $\frac{7\sqrt{3}}{2}.$ This means that the area of ABC is $\frac{7\sqrt{3}}{4}.$

The formula for the area of an equilateral triangle with side length s is $\frac{s^2\sqrt{3}}{4} (i$f you don't have this memorized it's not hard to derive). Comparing this formula to the area of ABC, we can easily find that $s^2=7,$ which means that the side length of ABC is $\boxed{\textbf{(B) } \sqrt{7}}.$

While this approach feels rather convoluted in comparison to Solution 1 (which only works for isosceles triangles), it is more flexible and can actually be generalized for any point in a general triangle (although that requires use of Heron's, and potentially Law of Sines and Cosines).

*~IAmTheHazard*
## Solution 5 (Coordinate Bashing)
Suppose A(0,$\sqrt{3}$a), B(-a,0), C(a,0) and P(x,y). So $s=2a$. Since BP = $\sqrt{3}$ and CP = 2, we have

$$
(x+a)^2+y^2=3
(x-a)^2+y^2=4
$$

Solving the equations, we have
$$x=-\frac{1}{4a},~~y=\sqrt{\frac72-a^2-\frac{1}{16a^2}}$$
From AP=1 (and a fair amount of algebra), we can have $a=\sqrt{7}/2$. The answer is $\boxed{\textbf{(B) } \sqrt{7}}.$

*~Linty Huang*
## Solution 6 (Diagram Nuke)
Drawing out a rough sketch, it appears that $\angle BPC = 90^{\circ}.$ By Pythagorean, our answer is $\sqrt{\sqrt{3}^2 + 2^2} = \boxed{\textbf{(B) } \sqrt{7}}.$

Proof of this fact can be found in the Video Solution by Richard Rusczyk below.
## Solution 7 (Theorem Nuke)
We can use the following theorem:
 $\text{For a point } P \text{ inside of an equilateral triangle } \triangle ABC \text{ and side length }s, 3(PA^4+PB^4+PC^4 + s^4)=(PA^2+PB^2+PC^2+s^2)^2$
We know that PA=1, PB=$\sqrt{3},$ and CP=2. Plugging these into our formula, we get $3(1+9+16+s^4)=(1+3+4+s^2)^2 \Rightarrow 78 + 3s^4=64+16s^2+$s^4 $\Rightarrow 2s^4-16s^2+14=0$. Let s^2=u. Then, we have $2u^2-16u+14=0$. Solving for u, we get $\frac{16 \pm \sqrt{144}}{4} = 4 \pm 3.$ If u is equal to 1, then we have $s=1$, but this is not possible since P is inside of the triangle. This means that $u=7$, and therefore $s=\boxed{\textbf{(B) } \sqrt{7}}.$

*~kn07*
## Solution 8 (More Coordinate Bashing)
Set the points A(0,0), B$\left(\frac{s}{2},\frac{s\sqrt{3}}{2}\right), C(s,0).$ Then, we want to find the intersection of the three circles $x^2+y^2=1, (x-s)^2+y^2=4,\left(x-\frac{s}{2}\right)^2+\left(y-\frac{s\sqrt{3}}{2}\right)^2=3.$ Subtracting circle 1 from circle 2 yields $s^2-2xs=3,$ which can be rewritten as $x=\frac{s^2-3}{2s}.$ Subtracting circle 1 from circle 3 yields $s^2-sx-ys\sqrt{3}=2,$ or $2s^2-$2sx-2ys$\sqrt{3}=4.$ Subtracting s^2-2xs=3 from this yields $s^2-2ys\sqrt{3}=1,$ or $y=\frac{s^2-1}{2s\sqrt{3}}.$

We then substitute our values for x and y back into $x^2+y^2=1,$ which gives us $\left(\frac{s^2-3}{2s}\right)^2+\left(\frac{s^2-1}{2s\sqrt{3}}\right)^2=1.$
Solving this equation (the algebra is surprisingly not bad!) gives us $s=\pm1,\pm\sqrt{7}.$ Since s must be greater than 1, the answer is $\boxed{\textbf{(B) } \sqrt{7}}.$

- curiousmind888 & TGSN
## Solution 9 (Trig Bash)
Let $\angle APC = \alpha, \angle CPB = \beta,$ by the Law of Cosine

$$
1^2+2^2 - 2 \cdot 1 \cdot 2 \cdot \cos \alpha = 2^2 + (\sqrt{3})^2 - 2 \cdot 2 \cdot \sqrt{3} \cdot \cos \beta
2^2 + (\sqrt{3})^2 - 2 \cdot 2 \cdot \sqrt{3} = (\sqrt{3})^2 + 1^2 - 2 \cdot \sqrt{3} \cdot 1 \cdot \cos (360^{\circ} - \alpha - \beta)
$$

Simplifying the two equations we get

$$
\sqrt{3} \cos \beta - \cos \alpha = \frac12
3 - 4 \sqrt{3} \cos \beta = - 2 \sqrt{3} ( \cos \alpha \cos \beta - \sin \alpha \sin \beta )
$$


Let $\cos \alpha =$ x, $\cos \beta =$ y, by simplifying we get:

$$
y\sqrt{3} - x = \frac12
3-4y\sqrt{3} = -2\sqrt{3} \left( xy - \sqrt{ (1-x^2)(1-y^2) } \right)
$$

Solving the first equation for y we get $y =\frac{ 2x \sqrt{3} + \sqrt{3} }{6}$

Substituting this into the second equation gives

$$
3-4\sqrt{3} \cdot \frac{ 2x \sqrt{3} + \sqrt{3} }{6} = -2\sqrt{3} \left( x \cdot \frac{ 2x \sqrt{3} + \sqrt{3} }{6} - \sqrt{ (1-x^2)(1- (\frac{ 2x \sqrt{3} + \sqrt{3} }{6})^2 ) } \right)
3-2(2x+1) = - 2\sqrt{3} \cdot x \cdot \frac{ 2x \sqrt{3} + \sqrt{3} }{6} + 2\sqrt{3} \cdot \sqrt{ (1-x^2)(1- (\frac{ 2x \sqrt{3} + \sqrt{3} }{6})^2 ) }
3 - 2x - 2 = -2x^2 - x + 2\sqrt{3} \cdot \sqrt{ (1-x^2)(1- (\sqrt{3})^2(\frac{ 2x + 1 }{6})^2 ) }
3 - 2x - 2 + 2x^2 + x = \sqrt{ 12 (1-x^2)(1- \frac{ 4x^2 + 4x + 1 }{12} ) }
1 - 3x + 2x^2 = \sqrt{ (1-x^2)(11 - 4x^2 - 4x) }
(1 - 3x + 2x^2)^2 = (1-x^2)(11 - 4x^2 - 4x)
1 - 3x + 2x^2 - 3x + 9x^2 - 6x^3 + 2x^2 - 6x^3 + 4x^4 = 11 - 4x - 4x^2 - 11x^2 + 4x^3 + 4x^4
1 - 6x + 13x^2 - 12x^3 = 11 - 4x - 15x^2 + 4x^3
8x^3 - 14x^2 + x + 5 = 0
(x-1)(4x-5)(2x+1) = 0
\cos \alpha<1, \quad \cos \alpha = x = -\frac12, \quad s = \sqrt{ 5 - 4 \cos \alpha } = \boxed{\textbf{(B) } \sqrt{7}}
$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Video Solutions
https://www.youtube.com/watch?v=mUW4zcrRL54

Video Solution by Richard Rusczyk -
https://www.youtube.com/watch?v=xnAXGUthO54&list=PLyhPcpM8aMvJvwA2kypmfdtlxH90ShZCc&index=4
- AMBRIGGS
## Note
This problem is very similar to 1967 AHSME Problem 40.
## See Also
