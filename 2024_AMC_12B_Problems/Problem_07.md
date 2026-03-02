# 2024 AMC 12B Problem 7

> This problem is the same as [2024 AMC 10B #11](https://artofproblemsolving.com/wiki/index.php/2024_AMC_10B_Problems/Problem_11) and [2024 AMC 12B #7](https://artofproblemsolving.com/wiki/index.php/2024_AMC_12B_Problems/Problem_7).
## Problem
In the figure below $WXYZ$ is a rectangle with $WX=4$ and $WZ=8$. Point $M$ lies $\overline{XY}$, point $A$ lies on $\overline{YZ}$, and $\angle WMA$ is a right angle. The areas of $\triangle WXM$ and $\triangle WAZ$ are equal. What is the area of $\triangle WMA$?

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
pair X = (0, 0);
pair W = (0, 4);
pair Y = (8, 0);
pair Z = (8, 4);
label("$X$", X, dir(180));
label("$W$", W, dir(180));
label("$Y$", Y, dir(0));
label("$Z$", Z, dir(0));
```


> [Asymptote diagram - not rendered in Markdown]

```asy
draw(W--X--Y--Z--cycle);
dot(X);
dot(Y);
dot(W);
dot(Z);
pair M = (2, 0);
pair A = (8, 3);
label("$A$", A, dir(0));
dot(M);
dot(A);
draw(W--M--A--cycle);
markscalefactor = 0.05;
draw(rightanglemark(W, M, A));
label("$M$", M, dir(-90));
```

</asy>

Note: On certain tests that took place in China, the problem asked for the area of $\triangle MAY$.

$\textbf{(A) }13 \qquad
$\textbf{(B) }14 \qquad$
$\textbf{(C) }15 \qquad$
$\textbf{(D) }16 \qquad$
$\textbf{(E) }17 \qquad$$
## Solution 1
We know that $WX = 4, WZ = 8$, so $YZ = 4$ and $YX = 8$. Since $\angle WMA = 90^\circ$, triangles $WXM$ and $MYA$ are similar. Therefore, $\frac{WX}{MY} = \frac{XM}{YA}$, which gives $\frac{4}{8 - XM} = \frac{XM}{4 - ZA}$. We also know that the areas of triangles $WXM$ and $WAZ$ are equal, so $WX \cdot XM = WZ \cdot ZA$, which implies $4 \cdot XM = 8 \cdot ZA$. Substituting this into the previous equation, we get $\frac{4}{8 - 2ZA} = \frac{2ZA}{4 - ZA}$, yielding $ZA = 1$ and $XM = 2$. Thus,


$$\triangle WMA = 4 \cdot 8 - \frac{4 \cdot 2}{2} - \frac{8 \cdot 1}{2} - \frac{6 \cdot 3}{2} = \boxed{\textbf{(C) }15}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Athmyx Athmyx]
## Solution 2
Let $XM=b$, $ZA = a$, $\cdot b= \cdot a$, $b = 2a$,


$$WM^2 + AM^2 = AW^2$$


$$(b^2+4^2) + (4-a)^2 + (8-b)^2  = (a^2 + 8^2)$$


$a=1$, $b=2$ ,


$$\triangle WMA = area(WXYZ) - \triangle WZA- \triangle WXM- \triangle MYA = 32 - 4-4-9 = \boxed{\textbf{(C) }15}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
*~minor edits by EaZ_Shadow*
## Solution 3 (Pythagorean Theorem)
Assign ZA as $x$, then AY as $4 - x$. Assign XM as $y$ and MY as $8 - y$. Since triangles WXM and WZA are equal in area, we can say $8x = 4y$, so $y = 2x$. Then, therefore, XM is $2x$ and MY has length $8 - 2x$. We can use the Pythagorean theorem to find WM, which is actually $\sqrt{(2x)^2 + 4^2)} = \sqrt{4x^2 + 16}$. We don't factor it yet - we are going to find $x$ again using the Pythagorean Theorem. Similarly, finding MA is just the square root of the squares of AY and MY individually, or $\sqrt{(8 - 2x)^2 + (4 - x)^2} = \sqrt{64 - 32x + 4x^2 + 16 - 8x + x^2} = \sqrt{5x^2 - 40x + 80}$. Then simply, WA is really $\sqrt{x^2 + 64}$.

Now we have the three sides of the right triangle: $\sqrt{4x^2 + 16}$, $\sqrt{5x^2 - 40x + 80}$, and $\sqrt{x^2 + 64}$. Per the Pythagorean theorem again, we can see $(4x^2 + 16) + (5x^2 - 40x + 80) = (x^2 + 64)$. Combining like terms gives us $8x^2 - 40x + 32 = 0$, then dividing by 8 gives $x^2 - 5x + 4 = 0$. As this elementary and well-known quadratic gives us the roots of $1$ and $4$, we can see it is a bit weird to have $x = 4$, as then point Z is point A. So we'll assume $x = 1$. We have two legs of the triangle by plugging in the sides with x in them, given that $x = $1: $\sqrt{20}$ and $\sqrt{45}$. We should know that $20 \cdot 45 = 900$, and $\sqrt{900} = 30.$ Dividing by 2 reveals us our answer: $\boxed{\textbf{(C) }15}$

*~pepper2831*
*~RoyalPawn38 (small edit)*

note: to further prove that 1 is the correct root, note that setting A at Z makes WZA have area 0. Therefore, WXM also has to have an area of 0. This makes it impossible for angle WMA to be a right angle, as WMA would simply become a right triangle with half the area of WXYZ, making MWA the right angle.

*~meihk_neiht*
## Solution 4 (Similar Triangles)
We are given $WX = 4, WZ = 8$. △ WXM and △ MYA have equal area, so let $XM = 2x$ and $ZA = x$. MY $= 8-2x$ and $AY = 4-x$.
From this, we can conclude that $\frac{MY}{AY} = \frac{8-2x}{4-x} = \frac{2}{1}$

Since $WM$ intersects parallel lines $WZ$ and $XY$, $\angle ZWM = \angle WMZ$. $\angle ZWM + \angle MWX = 90^\circ$, so $\circ - 90^\circ = \angle WMZ + \angle AMY$. Thus, $\angle MWX = \angle AMY$ and $\Delta WXM$ ~ $\Delta MYA$ due to AA Similarity.

Corresponding sides of similar triangles are proportional, so $\frac{WX}{XM} = \frac{MY}{AY}$ or $\frac{4}{2x} = \frac{2}{1}$. It is clear that $2x = 2$, and $x = 1$. Now, all we have to do is subtract the area of the rectangle by each of the three triangles.


$\Delta WMA$ = $8 \cdot 4$ - $\left(\frac{1}{2} \cdot 4 \cdot 2 \right)$ - $\left(\frac{1}{2} \cdot 8 \cdot 1 \right)$ - $\left(\frac{1}{2} \cdot 6 \cdot 3 \right)$

$\Delta WMA$ = $32 - 4 - 4 - 9$

$\Delta WMA$ = $\boxed{\textbf{(C) }15}$

*~peeghj*
*~NOOK (Minor LaTeX edits)*
## Solution 5 (Desperate)
Taking a look at the diagram bruh, points $M$ and $A$ seem to divide $\overline{XY}$ and $\overline{YZ}$ into $1:3$ ratios. With this assumption in mind, $XM=2, MY=6, YA=3$, and $AZ=1$. This means that the areas of $\triangle WXM$ and $\triangle WZA$ are $\frac{4(2)}{2}=4$ and $\frac{8(1)}{2}=4$ respectively, and the area of $\triangle MAY$ is $\frac{6(3)}{2}=9$. The area of rectangle $WXYZ=4(8)=32$, so subtracting the areas of triangles $WXM$, $WZA$, and $MAY$, we get that the area of $\triangle WMA=32-4-4-9=\boxed{\textbf{(C) 15}}$

*~phinetium (first edit!)*
## China Test Solution (Finding $\triangle MAY$)
From solution 3, instead of finding the area of $\triangle WMA$, we instead find  the area of $\triangle MAY$. Then $x = 1$ then we have $MA = 8 - 2x = 6$. Again, since $AY = 4 - x$, then $AY = 4 - 1 = 3.$ The area of a triangle with legs $3$ and $6$ is $\frac{3 * 6}{2} = \boxed{9}$.

*~pepper2831 (again)*

*~minor edits by fireball9746*

can someone pls explain why $\triangle MAY$ has the same area as $\triangle WMA$

$^ To$ the person above:
Under the problem, there’s a note that says some tests in China asked for the area of $\triangle MAY$. - trevian1
## Video Solution 1 by Pi Academy (Fast and Easy ⚡🚀)
https://youtu.be/YqKmvSR1Ckk?feature=shared

*~Pi Academy*
## Video Solution 2 by SpreadTheMathLove
https://youtu.be/782cQrY92Uc?si=KwONGMmze1cx7qUp
## Video Solution 3 by TheBeautyofMath
For AMC 10: https://youtu.be/dfF39udgqc8?si=3bOkC2YDgeINF3x2 in Rapid Fire
For AMC 12: https://youtu.be/AKLPjTRPF4Q?t=265 in Rapid Fire

*~IceMatrix*
## See also
