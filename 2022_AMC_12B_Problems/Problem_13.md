# 2022 AMC 12B Problem 13

> This problem is the same as [2022 AMC 10B #16](https://artofproblemsolving.com/wiki/index.php/2022_AMC_10B_Problems/Problem_16) and [2022 AMC 12B #13](https://artofproblemsolving.com/wiki/index.php/2022_AMC_12B_Problems/Problem_13).
## Problem
The diagram below shows a rectangle with side lengths $4$ and $8$ and a square with side length $5$. Three vertices of the square lie on three different sides of the rectangle, as shown. What is the area of the region inside both the square and the rectangle?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(5cm);
filldraw((4,0)--(8,3)--(8-3/4,4)--(1,4)--cycle,mediumgray);
draw((0,0)--(8,0)--(8,4)--(0,4)--cycle,linewidth(1.1));
draw((1,0)--(1,4)--(4,0)--(8,3)--(5,7)--(1,4),linewidth(1.1));
label("$4$", (8,2), E);
label("$8$", (4,0), S);
label("$5$", (3,11/2), NW);
draw((1,.35)--(1.35,.35)--(1.35,0),linewidth(1.1));
```

</asy>

$\textbf{(A) }15\dfrac{1}{8}  \qquad
$\textbf{(B) }15\dfrac{3}{8}  \qquad$
$\textbf{(C) }15\dfrac{1}{2}  \qquad$
$\textbf{(D) }15\dfrac{5}{8}  \qquad$
$\textbf{(E) }15\dfrac{7}{8}$$
## Solution 1
Let us label the points on the diagram.

<asy>
import olympiad;

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
defaultpen(linewidth(1) + fontsize(10));
pair A = (0,0), B = (1,0), C = (4,0), D = (8,0), K = (0,4), F = (1,4), G = (7.25, 4), H = (8, 4), I = (8,3), J = (5, 7);
fill(F--G--I--C--F--cycle, grey);
markscalefactor=0.05;
draw(A--D--H--K--A^^B--F^^F--C--I--J--F^^rightanglemark(F,J,I)^^rightanglemark(F,B,C)^^anglemark(D,C,I)^^anglemark(B,F,C)^^anglemark(H,I,G));
draw(anglemark(F,C,B)^^anglemark(C,I,D)^^anglemark(I,G,H));
markscalefactor=0.041;
draw(anglemark(F,C,B)^^anglemark(C,I,D)^^anglemark(I,G,H));
label("8",(4,-.5),S);
label("5",(3, 5.5),NW);
label("4",(8.25, 2), E);
label("A", F, NW);
label("B", B, S);
label("C", C, S);
label("D", D, SE);
label("E", I, E);
label("F", H, NE);
label("G", G, NE);
label("4", (1,2), E);
label("5", (2.5,2), SW);
label("3", (2.5,0), S);
label("4", (6,0), S);
label("5", (6,1.5), SE);
label("3", (8, 1.5), E);
label("1", (8, 3.5), E);
```

</asy>

By doing some angle chasing using the fact that $\angle ACE$ and $\angle CEG$ are right angles, we find that $\angle BAC = \angle DCE = \angle FEG$. Similarly, $\angle ACB = \angle CED = \angle EGF$. Therefore, $\triangle ABC \sim \triangle CDE \sim \triangle EFG$.

As we are given a rectangle and a square, $AB = 4$ and $AC = 5$. Therefore, $\triangle ABC$ is a $3-$4-$5$ right triangle and $BC = 3$.

$CE$ is also $5$. So, using the similar triangles, $CD = 4$ and $DE = 3$.

$EF = DF - DE = 4 - 3 = 1$. Using the similar triangles again, $EF$ is $\frac14$ of the corresponding $AB$. So,


$$\begin{align*}
[$\triangle EFG$] &= $\left(\frac14\right)^2 \cdot$ [$\triangle ABC$] \\

$$
&= \frac{1}{16} \cdot 6 \\
&= \frac38.
$$

$\end{align*}$$$


Finally, we have


$$\begin{align*}
[ACEG] &= [ABDF] - [$\triangle ABC$] - [$\triangle CDE$] - [$\triangle EFG$] \\

$$
&= 7 \cdot 4 - \frac12 \cdot 3 \cdot 4 - \frac12 \cdot 3 \cdot 4 - \frac38 \\
&= 28 - 6 - 6 - \frac38 \\
&= \boxed{\textbf{(D) }15\dfrac{5}{8}}.
$$

$\end{align*}$$$


*~Connor132435*
## Solution 2 (Clever)
(Refer to the diagram above)
Proceed the same way as Solution 1 until you get all of the side lengths. Then, it is clear that due to the answer choices, we only need to find the fractional part of the shaded area. The area of the whole rectangle is integral, as is the area of $\triangle ABC$, $\triangle CDE$, and the rectangle to the far left of the diagram. The area of $EFG$ is $\frac{3}{8}$ and thus the fractional part of the answer is $\frac{5}{8}$. The only answer choice that has $\frac{5}{8}$ in it is $\boxed{\textbf{(D) }15\dfrac{5}{8}}$

*~mathboy100*
## Solution 3 (Intuitive Risking)
[ center | 450px](https://artofproblemsolving.com/wiki/index.php/File:2022AMC10AQ16.png_)

We can quickly find out through Pythagorean Triples that $GH = 3$. Now, we make an educated guess that $G$ is the midpoint of $FI$, and therefore $HI = 1$.

Noice! So, now what? Well, $FG$ is then $4$, and $EF$ would then be $3$.

Given that info, we also see that $DE = 1$.

Our area of the rectangle $ADFI$ is $8 \times 4 = 32$. We then see that we must subtract rectangle $ABHI = 4 \times 1 = 4$, triangle $BHG = \frac{1}{2} \times 3 \times 4 = 6$, and triangle $GFE = \frac{1}{2} \times 4 \times 3 = 6$. This gives $32 - (4 + 6 + 6) = 16$.

We make a guess that the intersection between $B$ and $D$, call it $J$, to $E$ is exactly $5/4$. Then, through the Pythagorean theorem, $JD = 1/2$, and the area is $\frac{1}{2} \times \frac{1}{2} \times 1 = \frac{1}{4}$. So, the area of that mini triangle is $\frac{1}{4}$, in reality we know it is bigger. We subtract this from $16$ to get $15 \frac{3}{4}$ and take the closest answer choice that is lower than the result we got, which is $\boxed{\textbf{(D) }15\dfrac{5}{8}}$.

Take risks everyone! You might do great things like solve an AMC problem :D!

*~Pinotation*
## Solution 4 (Coordinate Geometry)
Same diagram as Solution 1, but added point $H$, which is $(4,7)$. I also renamed all the points to form coordinates using $B$ as the origin.
<asy>
import olympiad;

> [Asymptote diagram - not rendered in Markdown]

```asy
size(200);
defaultpen(linewidth(1) + fontsize(10));
pair A = (0,0), B = (1,0), C = (4,0), D = (8,0), K = (0,4), F = (1,4), G = (7.25, 4), H = (8, 4), I = (8,3), J = (5, 7);
fill(F--G--I--C--F--cycle, grey);
markscalefactor=0.05;
draw(A--D--H--K--A^^B--F^^F--C--I--J--F^^rightanglemark(F,J,I)^^rightanglemark(F,B,C)^^anglemark(D,C,I)^^anglemark(B,F,C)^^anglemark(H,I,G));
draw(anglemark(F,C,B)^^anglemark(C,I,D)^^anglemark(I,G,H));
markscalefactor=0.041;
draw(anglemark(F,C,B)^^anglemark(C,I,D)^^anglemark(I,G,H));
label("8",(4,-.5),S);
label("5",(3, 5.5),NW);
label("4",(8.25, 2), E);
label("A(0,4)", F, NW);
label("B(0,0)", B, S);
label("C(3,0)", C, S);
label("D(7,0)", D, SE);
label("E(7,3)", I, E);
label("F(7,4)", H, NE);
label("G", G, NE);
label("4", (1,2), E);
label("5", (2.5,2), SW);
label("3", (2.5,0), S);
label("4", (6,0), S);
label("5", (6,1.5), SE);
label("3", (8, 1.5), E);
label("1", (8, 3.5), E);
label("H(4,7)", (4.65, 7.25), E);
```

</asy>

In order to find the area, point $G$'s coordinates must be found. Notice how $EH$ and $AG$ intercept at point $G$. This means that we need to find the equations for $EH$ and $AG$ and make a system of linear equations.

Using the slope formula $m=\frac{y_{2} - y_{1}}{x_{2} - x_{1}}$, we get the slope for $EH$, which means $m=\frac{3-7}{7-4} = -\frac{4}{3}$

Then, by using point slope form. $y-y_{1}=m(x-x_{1})$. We can say that the equation for $EH$ is $y\frac{4}{3}(x-4)$ or in this case, $y=-\frac{4}{3}x+12 \frac{1}{3}$.

And it is easy to figure out that the equation for $AG$ is $y=4$.

The best way to solve the system of linear equations is to substitute the $y$ for the $4$ in equation $EH$.
$4=-\frac{4}{3}x+12 \frac{1}{3}$, so $x=6\frac{1}{4}$ and $y=4$ This would mean $G\left(6\frac{1}{4},4\right)$.

Since we have our $G$ coordinate, we can continue with Solution 3, with the area of the trapezoid $\left(\frac{EG+AC}{2}\right)(CE)$, where $EG=\frac{5}{4}$ (using distance formula for $E$ to $G), AC=5$, and $CE=5$.

By substitution, we get $\left(\frac{\frac{5}{4}+5}{2}\right)(5)=\boxed{\textbf{(D) }15\dfrac{5}{8}}$.

*~ghfhgvghj10 (+ minor edits ~TaeKim)*
## Solution 5 (FAST)
Notice the small triangle in the upper right corner is a $3-4-5$ triangle. Then that triangle is similar to the big triangle by AA similarity. From that, do similar triangles and you find that the longer leg of the small triangle is 1. Then you find that the triangle below is $3-4-5$, so the side length of the rectangle (without the outer rectangle) is 7. afterwards you just add the half of the square + the remaining triangle which can be found by multiplying base and height (in which we already know)

*~mathboy282*


I found the same solution when solving this, but essentially, we know all triangles in the picture are similar, and we know the lower left hand triangle is a $3-4-5$ triangle, and it is similar to the top triangle, where 4 corresponds to 5, therefore the unknown side length of that triangle is 15/4. Continuing on, the are of the white part of the square is $5 * 15/4 * 1/2 = 75/8,  25 - 75/8 = \fbox{(D)}$


*~kaiser*
## Solution 6 (Fastest Similar Triangles)
For reference, use the points labelled in the diagram of Solution 3. Let the point one unit to the right of $A$ be $A'$ (so that $A'$ is one of the vertices of the square). The square means $A'C = 5$, so we get a $3$-$4$-$5$ triangle $A'BC$.

$m\angle BA'C = 90 ^{\circ} - m\angle CA'G = m\angle GA'H$.

Therefore $\triangle GA'H$ is proportional to a $3-$4-$5$ triangle, with $HG$ corresponding to $3$ and $A'H$ corresponding to $4$. By similar triangles, we find

$HG = A'H \cdot \frac{3}{4} = \frac{15}{4}$.

; then, finally, $[A'CEG] = [A'CEH] - [\triangle GA'H] = 5^2 - \frac{1}{2} \cdot \frac{15}{4} \cdot 5 = \boxed{\textbf{(D) }15\dfrac{5}{8}}.$

*~lolsmybagelz (minor corrections by Technodoggo)*
## Video Solution by mop 2024
https://youtu.be/ezGvZgBLe8k&t=347s

*~r00tsOfUnity*
## Video Solution
https://youtu.be/xYkSx8h-Ixk

*~Education, the Study of Everything*
## Video Solution by SpreadTheMathLove
https://www.youtube.com/watch?v=NAu4AKlK-O0&list=PLmpPPbOoDfgj5BlPtEAGcB7BR_UA5FgFj&index=2

*~Ismail.maths*
## Video Solution 3 by OmegaLearn
https://youtu.be/mv2tYNhbAfk

*~pi_is_3.14*
## Video Solution(1-16)
https://youtu.be/SCwQ9jUfr0g

~~Hayabusa1
## Video Solution by Interstigation
https://youtu.be/B1ZjFYRY4-E

*~Interstigation*
## Video Solution by TheBeautyofMath
https://youtu.be/lgQaAQjJjEI

*~IceMatrix*
## See Also
