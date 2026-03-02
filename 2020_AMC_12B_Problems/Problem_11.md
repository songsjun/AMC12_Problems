# 2020 AMC 12B Problem 11

> This problem is the same as [2020 AMC 10B #14](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10B_Problems) and [2020 AMC 12B #11](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12B_Problems).
## Problem
As shown in the figure below, six semicircles lie in the interior of a regular hexagon with side length 2 so that the diameters of the semicircles coincide with the sides of the hexagon. What is the area of the shaded region ---- inside the hexagon but outside all of the semicircles?

$\textbf{(A) } 6\sqrt3 - 3\pi \qquad \textbf{(B) } \frac{9\sqrt3}{2} - 2\pi \qquad \textbf{(C) } \frac{3\sqrt3}{2} - \frac{\pi}{3} \qquad \textbf{(D) } 3\sqrt3 - \pi \qquad \textbf{(E) } \frac{9\sqrt3}{2} - \pi$
<asy>


> [Asymptote diagram - not rendered in Markdown]

```asy
size(140);
fill((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--cycle,gray(0.4));
fill(arc((2,0),1,180,0)--(2,0)--cycle,white);
fill(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle,white);
fill(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle,white);
fill(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle,white);
fill(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle,white);
fill(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle,white);
draw((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--(1,0));
draw(arc((2,0),1,180,0)--(2,0)--cycle);
draw(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle);
draw(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle);
draw(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle);
draw(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle);
draw(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle);
label("$2$",(3.5,3sqrt(3)/2),NE);
```


</asy>
## Solution 1
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
real x=sqrt(3);
real y=2sqrt(3);
real $z=3.5$;
real a=x/2;
real $b=0.5$;
real $c=3a$;
pair A, B, C, D, E, F;
A = (1,0);
B = (3,0);
C = (4,x);
D = (3,y);
E = (1,y);
F = (0,x);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
fill(A--B--C--D--E--F--A--cycle,grey);
fill(arc((2,0),1,0,180)--cycle,white);
fill(arc((2,y),1,180,360)--cycle,white);
fill(arc((z,a),1,60,240)--cycle,white);
fill(arc((b,a),1,300,480)--cycle,white);
fill(arc((b,c),1,240,420)--cycle,white);
fill(arc((z,c),1,120,300)--cycle,white);
draw(A--B--C--D--E--F--A);
draw(arc((z,c),1,120,300));
draw(arc((b,c),1,240,420));
draw(arc((b,a),1,300,480));
draw(arc((z,a),1,60,240));
draw(arc((2,y),1,180,360));
draw(arc((2,0),1,0,180));
label("2",(z,c),NE);
```


pair X,Y,Z;
X = (1,0);
Y = (2,0);
Z = (1.5,a);

> [Asymptote diagram - not rendered in Markdown]

```asy
pair $d = 1.9$*dir(7);
dot(X);
dot(Y);
dot(Z);
label("A",X,SW);
label("B",Y,SE);
label("C",Z,N);
draw(X--Y--Z--A);
label("1",(1.5,0),S);
label("1",(1.75,a/2),dir(30));
draw(anglemark(Y,X,Z,8),blue);
label("$\circ$",anglemark(Y,X,Z),d);
```

</asy>

Let point $A$ be a vertex of the regular hexagon, let point $B$ be the midpoint of the line connecting point $A$ and a neighboring vertex, and let point $C$ be the second intersection of the two semicircles that pass through point $A$. Then, $BC = 1$, since $B$ is the center of the semicircle with radius $1$ that $C$ lies on, $AB = 1$, since $B$ is the center of the semicircle with radius $1$ that $A$ lies on, and $\angle BAC = 60^\circ$, as a regular hexagon has angles of $120^\circ$, and $\angle BAC$ is half of any angle in this hexagon. Now, since $AB = BC$, $\angle ACB = \angle BAC = 60^\circ$. Since the angles in a triangle sum to $180^\circ$, $\angle ABC$ is also $60^\circ$. Therefore, $\triangle ABC$ is an equilateral triangle with side lengths of $1$.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
real x=sqrt(3);
real y=2sqrt(3);
real $z=3.5$;
real a=x/2;
real $b=0.5$;
real $c=3a$;
pair A, B, C, D, E, F;
A = (1,0);
B = (3,0);
C = (4,x);
D = (3,y);
E = (1,y);
F = (0,x);
```


> [Asymptote diagram - not rendered in Markdown]

```asy
fill(A--B--C--D--E--F--A--cycle,grey);
fill(arc((2,0),1,0,180)--cycle,white);
fill(arc((2,y),1,180,360)--cycle,white);
fill(arc((z,a),1,60,240)--cycle,white);
fill(arc((b,a),1,300,480)--cycle,white);
fill(arc((b,c),1,240,420)--cycle,white);
fill(arc((z,c),1,120,300)--cycle,white);
draw(A--B--C--D--E--F--A);
draw(arc((z,c),1,120,300));
draw(arc((b,c),1,240,420));
draw(arc((b,a),1,300,480));
draw(arc((z,a),1,60,240));
draw(arc((2,y),1,180,360));
draw(arc((2,0),1,0,180));
pair G,H,I,J,K;
G = (2,0);
H = (2.5,a);
I = (1.5,a);
J = (1,0);
K = (3,0);
pair $d = 2.7$*dir(78);
dot(G);
dot(H);
dot(I);
dot(J);
dot(K);
label("2",(z,c),NE);
label("1",(1.5,0),S);
label("1",(2.5,0),S);
```

add(pathticks(G--J,1,0.5,0,3,red));
add(pathticks(I--J,1,0.5,0,3,red));
add(pathticks(G--I,1,0.5,0,3,red));
add(pathticks(G--H,1,0.5,0,3,red));
add(pathticks(G--K,1,0.5,0,3,red));
add(pathticks(K--H,1,0.5,0,3,red));

> [Asymptote diagram - not rendered in Markdown]

```asy
label("$\circ$",anglemark(H,G,I),d);
draw(anglemark(H,G,I,8),blue);
label("$\circ$",G,2*dir(146));
draw(anglemark(I,G,J,8),blue);
label("$\circ$",G,2.8*dir(28));
draw(anglemark(K,G,H,8),blue);
draw(G--J--I--G);
draw(G--H--K--G);
```

</asy>

Since the area of a regular hexagon can be found with the formula $\frac{3\sqrt{3}s^2}{2}$, where $s$ is the side length of the hexagon, the area of this hexagon is $\frac{3\sqrt{3}(2^2)}{2} = 6\sqrt{3}$. Since the area of an equilateral triangle can be found with the formula $\frac{\sqrt{3}}{4}s^2$, where $s$ is the side length of the equilateral triangle, the area of an equilateral triangle with side lengths of $1$ is $\frac{\sqrt{3}}{4}\left(1^2\right) = \frac{\sqrt{3}}{4}$. Since the area of a circle can be found with the formula $\pi r^2$, the area of a sixth of a circle with radius $1$ is $\frac{\pi(1^2)}{6} = \frac{\pi}{6}$. In each sixth of the hexagon, there are two equilateral triangles colored white, each with an area of $\frac{\sqrt{3}}{4}$, and one-sixth of a circle with radius $1$ colored white, with an area of $\frac{\pi}{6}$. The rest of the sixth is colored gray. Therefore, the total area that is colored white in each sixth of the hexagon is $\left(\frac{\sqrt{3}}{4}\right) + \frac{\pi}{6}$, which equals $\frac{\sqrt{3}}{2} + \frac{\pi}{6}$, and the total area colored white is $\left(\frac{\sqrt{3}}{2} + \frac{\pi}{6}\right)$, which equals $\sqrt{3} + \pi$. Since the area colored gray equals the total area of the hexagon minus the area colored white, the area colored gray is $\sqrt{3} - (3\sqrt{3} + \pi)$, which equals $\boxed{\textbf{(D) }3\sqrt{3} - \pi}$.
## Solution 2
First, subdivide the hexagon into 24 equilateral triangles with side length 1:

> [Asymptote diagram - not rendered in Markdown]

```asy
<asy> size(140); fill((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--cycle,gray(0.4)); fill(arc((2,0),1,180,0)--(2,0)--cycle,white); fill(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle,white); fill(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle,white); fill(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle,white); fill(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle,white); fill(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle,white); draw((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--(1,0)); draw(arc((2,0),1,180,0)--(2,0)--cycle); draw(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle); draw(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle); draw(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle); draw(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle); draw(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle); label("$2$",(3.5,3sqrt(3)/2),NE);
draw((1,0)--(3,2sqrt(3)));
draw((3,0)--(1,2sqrt(3)));
draw((4,sqrt(3))--(0,sqrt(3)));
draw((2,0)--(3.5,3sqrt(3)/2));
draw((3.5,sqrt(3)/2)--(2,2sqrt(3)));
draw((3.5,3sqrt(3)/2)--(0.5,3sqrt(3)/2));
draw((2,2sqrt(3))--(0.5,sqrt(3)/2));
draw((2,0)--(0.5,3sqrt(3)/2));
draw((3.5,sqrt(3)/2)--(0.5,sqrt(3)/2));
```

</asy>
Now note that the entire shaded region is just 6 times this part:

> [Asymptote diagram - not rendered in Markdown]

```asy
<asy> size(100);
fill((2,sqrt(3))--(2.5,3sqrt(3)/2)--(2,2sqrt(3))--(1.5,3sqrt(3)/2)--cycle,gray(0.4));
fill(arc((2,2sqrt(3)),1,240,300)--(2,2sqrt(3))--cycle,white);
draw(arc((2,2sqrt(3)),1,240,300)--(2,2sqrt(3))--cycle);
label("$1$",(2.25,7sqrt(3)/4),NE);
draw((2,sqrt(3))--(2.5,3sqrt(3)/2)--(2,2sqrt(3))--(1.5,3sqrt(3)/2)--cycle);
draw((2.5,3sqrt(3)/2)--(1.5,3sqrt(3)/2));
```

</asy>
The entire rhombus is just 2 equilateral triangles with side lengths of 1, so it has an area of:


$$2\cdot\frac{\sqrt{3}}{4}=\frac{\sqrt{3}}{2}$$


The sector that is not included has an area of:


$$\frac16 \cdot\pi \cdot1^2 = \frac{\pi}{6}$$


Hence, the area of the shaded region in that section is

$$\frac{\sqrt{3}}{2}-\frac{\pi}{6}$$


For a final area of:


$$6\left(\frac{\sqrt{3}}{2}-\frac{\pi}{6}\right)=3\sqrt{3}-\pi\Rightarrow \boxed{\mathrm{(D)}}$$


*~N828335*
## Solution 3
We can see there are six congruent "leaves" on the original figure, and let us say the total area of them is $S$. If we make a circle with radius one in the circle (the dashed one), we can get another six congruent "leaves", and they are the same as the old six ones. So the area of the six new leaves can also be represented by $S$.
Then the area of the shaded region can be expressed in the following two ways:

$[1]$. $\textbf{Area}$ of hexagon - ($\textbf{Area}$ of six semicircles $-\textbf{Area}$ of six $\textbf{old}$ "leaves") $=\frac{\sqrt{3}}{4} \cdot 4 \cdot 6 - (3\pi - S);$

$[2]$. $\textbf{Area}$  of  dashed  circle $-\textbf{Area}$ of six $\textbf{new}$ "leaves" = $\pi - S;$

Then we have $\frac{\sqrt{3}}{4} \cdot 4 \cdot 6 - (3\pi - S) = \pi - S$

$S = 2\pi - 3\sqrt{3}$

Plugging $S$ back in to either $[1]$ or $[2]$, we can solve for the shaded area $= \sqrt{3} - \pi\rightarrow\boxed{\mathrm{(D)}}$

--RyanZ@BRS

--Extremelysupercooldude (Minor latex and grammar edits)

*~Yelechi (LaTeX edits)*

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(140);
fill((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--cycle,gray(0.4));
fill(arc((2,0),1,180,0)--(2,0)--cycle,white);
fill(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle,white);
fill(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle,white);
fill(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle,white);
fill(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle,white);
fill(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle,white);
draw((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--(1,0));
draw(arc((2,0),1,180,0)--(2,0)--cycle);
draw(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle);
draw(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle);
draw(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle);
draw(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle);
draw(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle);
label("$2$",(3.5,3sqrt(3)/2),NE);
draw(Arc((2,sqrt(3)), 1, 0, 360),dashed+linewidth(.5));
```

</asy>
## Solution 4 (Variables)
We can set several variables.

Let $x$ be the area of the shaded region, and let $y$ be the area of one of the 'leaf-shaped' regions.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(140);
fill((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--cycle,gray(0.4));
fill(arc((2,0),1,180,0)--(2,0)--cycle,white);
fill(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle,white);
fill(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle,white);
fill(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle,white);
fill(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle,white);
fill(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle,white);
draw((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--(1,0));
label("$2$",(3.5,3sqrt(3)/2),NE);
label("$x$",(2,1.6),N);
label("$y$",(1.3,3.2),S);
draw(arc((2,0),1,180,0)--(2,0)--cycle);
draw(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle);
draw(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle);
draw(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle);
draw(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle);
draw(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle);
draw((2.5,3sqrt(3)/2)--(1.5,3sqrt(3)/2));
draw((2.5,0.87)--(3,2sqrt(3)/2));
draw((3,2sqrt(3)/2)--(2.5,3sqrt(3)/2));
draw((1,1.73)--(1.5,2.6));
draw((1.5,0.87)--(1,1.73));
draw((2.5,sqrt(3)/2)--(1.5,sqrt(3)/2));
label("$1$", (1.2,2.2),W);
```

</asy>

We then can connect the vertices of $x$, and we end up with another hexagon, with side length $1$. Since each of the regions that are outside of $x$ but inside of the smaller hexagon is half of $y$, their total area is $\frac{6y}{2} = 3y$. The smaller hexagon minus this region would be $x$. So,


$$x= \frac{3\sqrt{3}}{2} \cdot 1^{2} - 3y$$


Also, the area of the larger hexagon minus the semicircles *then add* back $6y$ would also be $x$. (Note that by just subtracting the semicircles from the larger hexagon would result in an overlap of $6y$.) So,


$$x= \frac{3\sqrt{3}}{2} \cdot 2^{2} - 3\pi + 6y$$


Equating the equations, we have


$$\begin{align*}

$$
\frac{3\sqrt{3}}{2} \cdot 1^{2} - 3y &= \frac{3\sqrt{3}}{2} \cdot 2^{2} - 3\pi + 6y \\
\frac{3\sqrt{3}}{2} - 3y &= 6\sqrt{3} - 3\pi + 6y \\
$$

$\end{align*}$$$


Solving for $y$, we have


$$\begin{align*}

$$
9y &= \frac{3\sqrt{3}}{2} - 6\sqrt{3} + 3\pi \\
&=-\frac{9\sqrt{3}}{2} + 3\pi \\
$$

$\end{align*}$$$


Then, we can plug this back into


$$x= \frac{3\sqrt{3}}{2} \cdot 1^{2} - 3y$$


Since $9y = \frac{9\sqrt{3}}{2} + 3\pi$, dividing by $3$ gives


$$\begin{align*}

$$
3y &= -\frac{9\sqrt{3}}{2} \times \frac{1}{3} + \pi \\
&=-\frac{3\sqrt{3}}{2} + \pi \\
$$

$\end{align*}$$$


Therefore, $x = \frac{3\sqrt{3}}{2} - (-\frac{3\sqrt{3}}{2} + \pi) \implies x= \boxed{\textbf{(D)} ~3\sqrt{3} - \pi}$.

*~MrThinker*
## Solution 5
<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(140);
fill((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--cycle,gray(0.4));
fill(arc((2,0),1,180,0)--(2,0)--cycle,white);
fill(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle,white);
fill(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle,white);
fill(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle,white);
fill(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle,white);
fill(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle,white);
draw((1,0)--(3,0)--(4,sqrt(3))--(3,2sqrt(3))--(1,2sqrt(3))--(0,sqrt(3))--(1,0));
label("$2$",(3.5,3sqrt(3)/2),NE);
draw(arc((2,0),1,180,0)--(2,0)--cycle);
draw(arc((3.5,sqrt(3)/2),1,60,240)--(3.5,sqrt(3)/2)--cycle);
draw(arc((3.5,3sqrt(3)/2),1,120,300)--(3.5,3sqrt(3)/2)--cycle);
draw(arc((2,2sqrt(3)),1,180,360)--(2,2sqrt(3))--cycle);
draw(arc((0.5,3sqrt(3)/2),1,240,420)--(0.5,3sqrt(3)/2)--cycle);
draw(arc((0.5,sqrt(3)/2),1,300,480)--(0.5,sqrt(3)/2)--cycle);
draw((2.5,3sqrt(3)/2)--(1.5,3sqrt(3)/2));
draw((2.5,0.87)--(3,2sqrt(3)/2));
draw((3,2sqrt(3)/2)--(2.5,3sqrt(3)/2));
draw((1,1.73)--(1.5,2.6));
draw((1.5,0.87)--(1,1.73));
draw((2.5,sqrt(3)/2)--(1.5,sqrt(3)/2));
label("$1$", (2, 0.9), S);
draw((1.43, 1)--(2, 0)--(2.57, 1));
```

</asy>

First we connect every vertex of the shaded portion to another, forming an equilateral hexagon. Each interior angle of this hexagon is $120^{\circ},$ the interior angles of the new triangle are all $60^{\circ}$. As the radius of the semicircle is $1$, we know that this hexagon has side length $1$, so its area is given by the combined area of six equilateral triangles with side length $1$, or $\frac{\sqrt{3}}{4}\cdot 6 = \frac{3\sqrt{3}}{2}.$

Now, we have to subtract off the six mini-sectors between the triangle and the shaded area. The area of one of these mini-sectors is the difference between a $60^{\circ}$ sector of the semicircle and the equilateral we just drew. The area of a sector is just $\frac{\pi}{6}$, and the area of a triangle is $\frac{\sqrt{3}}{4}.$ Therefore our combined area of the mini-sectors is


$$6\left(\frac{\pi}{6} - \frac{\sqrt{3}}{4}\right) = \pi-\frac{3\sqrt{3}}{2}.$$


Subtracting this from the area of the (smaller) hexagon, the desired area is


$$\frac{3\sqrt{3}}{2} -\left(\pi - \frac{3\sqrt{3}}{2}\right) = \boxed{\textbf{(D)} ~3\sqrt{3} - \pi}$$


*~Benedict T (countmath1)*
## Video Solution (HOW TO CREATIVELY THINK AND SOLVE!!!)
https://youtu.be/LT2TQj9Y6KI

*~Education, the Study of Everything*
## Video Solution
https://youtu.be/t6yjfKXpwDs?t=786
https://youtu.be/0xgTR3UEqbQ
## Video Solution
https://youtu.be/oTqx8OqSMQI

~$DSA_Catachu$
## Video Solution
https://youtu.be/NsQbhYfGh1Q?t=2046
## See Also
