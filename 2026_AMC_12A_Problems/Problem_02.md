# 2026 AMC 12A Problem 2

> This problem is the same as [2026 AMC 10A #3](https://artofproblemsolving.com/wiki/index.php/2026_AMC_10A_Problems/Problem_3) and [2026 AMC 12A #2](https://artofproblemsolving.com/wiki/index.php/2026_AMC_12A_Problems/Problem_2).

## Problem
Square $ABCD$ has side length $24$. Let $E$ be the midpoint of $\overline{BC}$, and let $F$ be the intersection of $\overline{AE}$ and $\overline{BD}$.



![AoPS diagram 1](../2026_AMC_12A_Problems/media/problem-02-diagram-01.svg)



What is the area of $\triangle BEF$?



$$
\textbf{(A)}\   36  \qquad
	\textbf{(B)}\   40  \qquad
	\textbf{(C)}\   45  \qquad
	\textbf{(D)}\   48  \qquad
	\textbf{(E)}\   52
$$



## Solution 1
To find the intersection point of the two lines, we can turn them into a system of equations. $\overline{AFE}$ becomes $y=-2x+24$, and $\overline{BFD}$ becomes $y=x$. Solving, we get $y=x=8$. Therefore the height of the triangle is $8$ and the base is $12$. So $\frac{8\cdot12}{2}=\boxed{48}$.
~MrThinker

Edit: Both $\overline{AFE}$ and $\overline{BFD}$ were written as $\overline{ABC}$ ~ GETTHEMONKEY

## Solution 2
$\overline{AD}$ is parallel to $\overline{BC}$, so $\angle{ADF} = \angle{FBE}$ and $\angle{DAF} = \angle{FEB}$. By the AA similarity theorem, $ADF \sim EBF$. Let the height of the triangle $EBF$ be $x$. $AD = 24$ and$EB = 12$, so the height of the triangle $DAF$ is twice the height of $FEB$. The sum of the two heights covers the whole height of the rectangle, so $3x = 24$, and $x = 8$. Therefore, the area of the triangle is $\frac{12 \cdot8}{2} = 48$ $\fbox{D}$. $\newline$
$\sim$cyrus825

## Solution 3
We can see that $\overline{AE}$ is a median of $\triangle ABC$. Let $\overline{BD}$ intersect $\overline{AC}$ at $G$, so $\overline{BG}$ is another median and $F$ is the centroid. The medians of $\triangle ABC$ split it into six triangles of equal area, and $\triangle BEF$ is one of them. Therefore,


$$
[BEF]=\frac{1}{6}[ABC]=\frac{1}{6}\cdot288=\boxed{\textbf{(D)}~48}
$$



~ [Logibyte](https://artofproblemsolving.com/wiki/index.php/Logibyte)

## Solution 4 (Coordinate geometry)
We can solve this problem using coordinate geometry. Define B to be $(0,0)$. We can find the intersection of lines $\overline{BD}$ and $\overline{AE}$ by defining these lines as $y=x$ and $y=-2x+24$, respectively. Solving these equations, we find the intersection point to be at $(8,8)$ Finally, using Shoelace Theorem, we find the total area to be $\frac{1}{2}|(0+0+12\cdot 8)-(0+0+0)|=48$, so the answer is $\boxed{\textbf{D}}$
~Voidling

## Solution 5 (Cheese)
Measure the base and height, and scale it to match the quantities in the problem. Then calculate the area. 
WARNING!!! - Only do this if you have 30 seconds left.
$\newline$
$\sim$MATH_1S_AWESOME

Edit: Diagrams are NOT drawn to scale so this won't work
$\newline$
Edit: Diagrams are usually drawn to scale, even though they say it doesn't have to be drawn to scale so you don't use the niche technique of ruler bashing
$\newline$
Edit: why would you have 30 seconds left while on the second problem

## Solution 6 (Area ratios)
We know that triangle $ABE$ has area $\frac{12 \times 24}{2}$, which is just $144$. Since the line $BD$ bisects the angle $\angle ABE$, we can use the properties of the angle bisector theorem. By the angle bisector theorem:


$$
\frac{AF}{FE} = \frac{AB}{BE}
$$




$$
\frac{AF}{FE} = \frac{24}{12} = \frac{2}{1}
$$


Therefore, $AF = 2FE$. This means that $FE = \frac{1}{3}AE$, which helps us conclude that the area of $\triangle BFE$ is $\frac{1}{3}$ of the area of $\triangle ABE$. 

So our answer is:


$$
\frac{144}{3} = \boxed{48}
$$



~Chiragnoodles

## Solution 7 (Bashing)
We know that square $ABCD$ has area of 576, triangle $ABE$ has area of 144 and triangle $BCD$ has area 288. Now we use the answer choices to figure out the area of the remaining two triangles. Using 48 as the area of triangle $BEF$ we can find that the triangle’s height to be 8. This means triangle $AFD$ has a height of 24 - 8 = 16. Now we calculate the area of triangle $AFD$ to be 192. Since triangle $ABE$ and $BCD$ overlap we must subtract the area of $BEF$. We get 144 + 288 + 192 - 48 =576. Since 576 is the area of $ABCD$ we know the area of $BEF$ is 48. Hence we get answer 

$$
\boxed{48}
$$



~MATHGURU2015 (First time adding a solution to AOPS, please correct any formatting errors)

## Solution 8 (super duper cheese)
Recognize this is the [construction of a third.](https://tasks.illustrativemathematics.org/content-standards/tasks/1571)

$\frac{24}{3} \times 12 \times \frac{1}{2} = \boxed{\textbf{(D)}~48}$

## Solution 9 (Cross Product)
Establish a coordinate system with point $B$ at the origin $(0,0)$, $C$ at $(24,0)$, $A$ at $(0,24)$, and $D$ at $(24,24)$. Since $E$ is the midpoint of $\overline{BC}$, its coordinates are $(12,0)$.

This allows us to write linear equations representing lines $AE$ and $BD$:
- Line $AE$ passes through $(0,24)$ and $(12,0)$, giving $y = -2x + 24$.
- Line $BD$ passes through $(0,0)$ and $(24,24)$, giving $y = x$.

Setting these equations equal to find their intersection point $F$:


$$
x = -2x + 24 \implies 3x = 24 \implies x = 8
$$


Thus, the intersection $F$ is at $(8,8)$. Since point $B$ is at $(0,0)$, we can represent two sides of $\triangle BEF$ as vectors in three dimensions (assuming a $z$-component of $0$):


$$
\overrightarrow{BF} = \langle 8, 8, 0 \rangle \quad \text{and} \quad \overrightarrow{BE} = \langle 12, 0, 0 \rangle
$$



Taking the cross product of these two vectors gives:


$$
\overrightarrow{BF} \times \overrightarrow{BE} = \begin{vmatrix} \mathbf{i} & \mathbf{j} & \mathbf{k} \\ 8 & 8 & 0 \\ 12 & 0 & 0 \end{vmatrix} = \langle 0, 0, (8)(0) - (8)(12) \rangle = \langle 0, 0, -96 \rangle
$$



Taking half the magnitude of the cross product gives the area of $\triangle BEF$:


$$
\text{Area} = \frac{1}{2} \left\| \overrightarrow{BF} \times \overrightarrow{BE} \right\| = \frac{1}{2} \sqrt{0^2 + 0^2 + (-96)^2} = \frac{96}{2} = \boxed{\textbf{(D) } 48}
$$


~thesuperioraxolotl

## Video Solution (Fast and Easy)
https://www.youtube.com/watch?v=JPFWG_ckccg

~ Pi Academy

## Video Solution 1 (Coordinate Geometry)
https://youtu.be/sNFSsL75LGE?t=121

~Foozono ~MathisFun

## Video Solution 2 (Angle Bisector/Area Ratios)
https://youtu.be/sNFSsL75LGE?t=289

~Chiragnoodles ~MathisFun

## Video Solution 3 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
