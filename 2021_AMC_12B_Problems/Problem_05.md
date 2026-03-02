# 2021 AMC 12B Problem 5

> This problem is the same as [2021 AMC 10B #9](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10B_Problems#Problem_9) and [2021 AMC 12B #5](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12B_Problems#Problem_5).
## Problem
The point P(a,b) in the xy-plane is first rotated counterclockwise by $90^\circ$ around the point (1,5) and then reflected about the line y = -x. The image of P after these two transformations is at (-6,3). What is b - a ?

$\textbf{(A)} ~1 \qquad\textbf{(B)} ~3 \qquad\textbf{(C)} ~5 \qquad\textbf{(D)} ~7 \qquad\textbf{(E)} ~9$
## Solution 1 (Transformation Rules)
The final image of P is (-6,3). We know the reflection rule for reflecting over y=-x is (x,y) $\rightarrow (-y, -x).$ So before the reflection and after rotation the point is (-3,6).

By definition of rotation, the slope between (-3,6) and (1,5) must be perpendicular to the slope between (a,b) and (1,5). The first slope is $\frac{5-6}{1-(-3)} = \frac{-1}{4}.$ This means the slope of P and (1,5) is 4.

Rotations also preserve distance to the center of rotation, and since we only "travelled" up and down by the slope once to get from (-3,6) to (1,5) it follows we shall only use the slope once to travel from (1,5) to P.

Therefore point P is located at $(1+1, 5+4) = (2,9)$. The answer is $9-2 = 7=\boxed{\textbf{(D)} ~7}.$

*~abhinavg0627*
## Solution 2 (Complex Numbers)
Let us reconstruct that coordinate plane as the complex plane. Then, the point P(a, b) becomes $a+b\cdot{i}.$
A $90^\circ$ rotation around the point (1, 5) can be done by translating the point (1, 5) to the origin, rotating around the origin by
$90^\circ,$ and then translating the origin back to the point (1, 5).

$$a+b\cdot{i} \implies (a-1)+(b-5)\cdot{i} \implies ((a-1)+(b-5)\cdot{i})\cdot{i} = 5-b+(a-1)i \implies 5+1-b+(a-1+5)i = 6-b+(a+4)i.$$

By basis reflection rules, the reflection of (-6, 3) about the line y = -x is (-3, 6).
Hence, we have 6-b+($a+4)i = -3+6i\impliesb=9, a=2$, from which b-$a = 9-2 =\boxed{\textbf{(D)} ~7}.$

*~twotothetenthis1024*
## Solution 3 (Reverso)
The problem gives a series of transformations and proceeds to give the resultant point, being (-6,3)=P. Therefore, all we must do is reverse it. First, we reverse the last transformation by computing the distance from the point (-6,3) to y=-x by using the formula $d=\frac{|Ax+By+C|}{\sqrt{A^2+B^2}}.$ Where Ax+By+C is the standard form of a line. Computing, we obtain that $d=\frac{3\sqrt{2}}{2}.$ We also know that this is magnitude is at an angle of $\frac{\pi}{4}.$ Therefore, to do the transformation, we double that vector and add it to the point. We get:


$$
P^{'}=P+2\overrightarrow{v}
\implies P'=(-6,3)+\left\langle 3\sqrt{2}\cdot \frac{\sqrt{2}}{2},3\sqrt{2}\cdot \frac{\sqrt{2}}{2} \right \rangle
\implies P'=(-3,6).
$$


Now, we must reverse the second transformation. To do so, realize that P'-(1,5)\Leftrightarrow $\overrightarrow{v_{2}}=\left\langle -4,1 \right\rangle$ . Simply make this vector perpendicular by switching the x and y components and switching the sign of the initial y component. Therefore, we get $\overrightarrow{v_{2\bot }}=\left\langle 1,4 \right\rangle$ . Therefore, adding this vector to (1,5) yields (2,9), which leads us to 9-2 = $\boxed{\textbf{(D)} ~7}.$

*~justgiveup JoshKosh*
## Solution 4 (Vector Dot Product)
Using the same method as in Solution 1, we can obtain that the point before the reflection is (-3,6).
If we let the original point be (x, y), then we can use that the starting point is (1,5) to obtain two vectors $\langle -4,1 \rangle$ and $\langlex-1, y-5\rangle.$
We know that two vectors are perpendicular if their dot product is equal to 0, and that both points are the same distance ( $\sqrt$ {17}) from (1,5).

Therefore, we can write two equations using these vectors:
$(x-1)^2 + (y-5)^2 = 17$ (from distance and pythagorean theorem) and -$4x+y-1 = 0$ (from dot product)

Solving, we simplify the second equation to y=$4x+1$, and plug it into the first equation.
We obtain $(x-1)^2 + (4x-4)^2 = 17$. We can simplify this to the quadratic $17x^2-34x=0$.
When we factor out $17x$, we find that $x = 2$ or $x = 0$. However, x cannot equal 0.
Therefore, $x = 2$, and plugging this into the second equation gives us that $y = 9$.
Since the point is (9, 2), we compute 9-2 = $\boxed{\textbf{(D)} ~7}.$

*~saturnrocket*
## Solution 5 (Vector Dot Product scuffed version)
Using the same method as in Solution 1 reflecting (-6,3) about the line y = -x gives us (-3,6).

Let the original point be $\langle$ x,y $\rangle.$ From point (1,5), we form the vectors $\langle -4,1 \rangle$ and $\langlex-1, y-5\rangle$ that extend out from the initial point. If they are perpendicular, we know that their dot product has to equal zero. Therefore, $\langle -4,1 \rangle \cdot \langlex-1, y-5\rangle = 0 \implies -4x+y-1= 0$.Now, we have to do some guess and check from the multiple choices. Let y - x = A where A is one of the answer choices. Then, A -$3x = 1$. By intuition and logical reasoning we deduce that A must be 1 $\pmod 3$ so that brings our potential answers down to $\text{\textbf{(A)}}$ and $\text{\textbf{(C)}}.$ If A = 1 from $\text{\textbf{(A)}},$ then $x = 0$, which we can quickly rule out since we know thar P rotated counterclockwise not clockwise. Hence, $\boxed{\textbf{(D)} ~7}$ is the answer.

*~peelybonehead*
## Solution 6 (Working Backwards Approach, Super Easy!)
The last thing that happened was the reflection over the line y = -x, so we reverse that by reflecting (-6,3) over y = -x to get (-3,6). Now, we have to rotate it $\textbf{clockwise},$ to reverse the first step. To rotate (-3,6) over the point (1,5) clockwise 90 degrees, we can subtract 1 from each x-coordinate and subtract 5 from each y-coordinate. That way, we only have to rotate (-4,1) clockwise 90 degrees over the origin (0,0). This is pretty easy to do in your head, so you get (1,4). But we are not, done, we still have to add 1 to each x-coordinate and add 5 to each y-coordinate, to get (2,9), so our final answer is $9 - 2 = 7$, which is $\boxed{\textbf{(D)} ~7}.$

*~NXC*
## Video Solution by Punxsutawney Phil
https://youtube.com/watch?v=qpvS2PVkI8A&t=335s
## Video Solution by OmegaLearn (Rotation & Reflection tricks)
https://youtu.be/VyRWjgGIsRQ

*~pi_is_3.14*
## Video Solution by Hawk Math
https://www.youtube.com/watch?v=VzwxbsuSQ80
## Video Solution by TheBeautyofMath
https://youtu.be/GYpAm8v1h-U?t=860 (for AMC 10B)

https://youtu.be/EMzdnr1nZcE?t=814 (for AMC 12B)

*~IceMatrix*
## Video Solution by Interstigation
https://youtu.be/DvpN56Ob6Zw?t=776

*~Interstigation*
## Video Solution (Just 3 min!)
https://youtu.be/j39KCUC2Qz8

*~Education, the Study of Everything*
## See Also
