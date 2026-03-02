# 2018 AMC 12A Problem 18

> This problem is the same as [2018 AMC 10A #24](https://artofproblemsolving.com/wiki/index.php/2018_AMC_10A_Problems/Problem_24) and [2018 AMC 12A #18](https://artofproblemsolving.com/wiki/index.php/2018_AMC_12A_Problems/Problem_18).
## Problem
Triangle $ABC$ with $AB=50$ and $AC=10$ has area $1$20. Let $D$ be the midpoint of $\overline{AB}$, and let $E$ be the midpoint of $\overline{AC}$. The angle bisector of $\angle BAC$ intersects $\overline{DE}$ and $\overline{BC}$ at $F$ and $G$, respectively. What is the area of quadrilateral $FDBG$?

$\textbf{(A) }60 \qquad
$\textbf{(B) }65 \qquad$
$\textbf{(C) }70 \qquad$
$\textbf{(D) }75 \qquad$
$\textbf{(E) }80 \qquad$$
## Diagram
[file:2018_amc_10$a_24_accurate_diagram$.png](https://artofproblemsolving.com/wiki/index.php/file:2018_amc_10a_24_accurate_diagram.png)
## Solution 1
Let $BC = a$, $BG = x$, $GC = y$, and the length of the perpendicular from $BC$ through $A$ be $h$. By angle bisector theorem, we have that

$$\frac{50}{x} = \frac{10}{y},$$

 where $y = -x+a$. Therefore substituting we have that $BG=\frac{5a}{6}$. By similar triangles, we have that $DF=\frac{5a}{12}$, and the height of this trapezoid is $\frac{h}{2}$. Then, we have that $\frac{ah}{2}=120$. We wish to compute $\frac{5a}{8}\cdot\frac{h}{2}$, and we have that it is $\boxed{\textbf{(D) }75}$ by substituting.
## Solution 2
For this problem, we have $\triangle{ADE}\sim\triangle{ABC}$ because of SAS and $DE = \frac{BC}{2}$. Therefore, $\bigtriangleup ADE$ is a quarter of the area of $\bigtriangleup ABC$, which is $30$. Subsequently, we can compute the area of quadrilateral $BDEC$ to be $120 - 30 = 90$. Using the angle bisector theorem in the same fashion as the previous problem, we get that $\overline{BG}$ is $5$ times the length of $\overline{GC}$. We want the larger piece, as described by the problem. Because the heights are identical, one area is $5$ times the other, and $\frac{5}{6} \cdot 90 = \boxed{\textbf{(D) }75}$.
## Solution 3
The ratio of the $\overline{BG}$ to $\overline{GC}$ is $5:1$ by the Angle Bisector Theorem, so area of $\bigtriangleup ABG$ to the area of $\bigtriangleup ACG$ is also $5:1$ (They have the same height). Therefore, the area of $\bigtriangleup ABG$ is $\frac{5}{5+1}\times120=100$. Since $\overline{DE}$ is the midsegment of $\bigtriangleup ABC$, so $\overline{DF}$ is the midsegment of $\bigtriangleup ABG$ . Thus, the ratio of the area of $\bigtriangleup ADF$ to the area of $\bigtriangleup ABG$ is $1:4$, so the area of $\bigtriangleup ACG$ is $\frac{1}{4}\times100=25$. Therefore, the area of quadrilateral $FDBG$ is $[ABG]-[ADF]=100-25=\boxed{\textbf{(D) }75}$
## Solution 4
The area of quadrilateral $FDBG$ is the area of $\bigtriangleup ABG$ minus the area of $\bigtriangleup ADF$. Notice, $\overline{DE} || \overline{BC}$, so $\bigtriangleup ABG \sim \bigtriangleup ADF$, and since $\overline{AD}:\overline{AB}=1:2$, the area of $\bigtriangleup ADF:\bigtriangleup ABG=(1:2)^2=1:4$. Given that the area of $\bigtriangleup ABC$ is $120$, using $\frac{bh}{2}$ on side $AB$ yields $\frac{50h}{2}=120\implies \frac{240}{50}=\frac{24}{5}$. Using the Angle Bisector Theorem, $\overline{BG}:\overline{BC}=50:(10+50)=5:6$, so the height of $\bigtriangleup ABG: \bigtriangleup ACB=5:6$. Therefore our answer is $\big[ FDBG\big] = \big[ABG\big]-\big[ ADF\big] = \big[ ABG\big]\big(\frac{1}{4}\big)=\frac{3}{4}\cdot \frac{bh}{2}=\frac{3}{8}\cdot 50\cdot \frac{5}{6}\cdot \frac{24}{5}=\frac{3}{8}\cdot 200=\boxed{\textbf{(D) }75}$
## Solution 5 (Trigonometry)
We try to find the area of quadrilateral $FDBG$ by subtracting the area outside the quadrilateral but inside triangle $ABC$. Note that the area of $\triangle ADE$ is equal  to $\frac{1}{2} \cdot 25 \cdot 5 \cdot \sin{A}$ and the area of triangle $ABC$ is equal to $\frac{1}{2} \cdot 50 \cdot 10 \cdot \sin A$. The ratio $\frac{[ADE]}{[ABC]}$ is thus equal to $\frac{1}{4}$ and the area of triangle $ADE$ is $\frac{1}{4} \cdot 120 = 30$. Let side $BC$ be equal to $6x$, then $BG = 5x, GC = x$ by the angle bisector theorem. Similarly, we find the area of triangle $AGC$ to be $\frac{1}{2} \cdot 10 \cdot x \cdot \sin C$ and the area of triangle $ABC$ to be $\frac{1}{2} \cdot 6x \cdot 10 \cdot \sin C$. A ratio between these two triangles yields $\frac{[ACG]}{[ABC]} = \frac{x}{6x} = \frac{1}{6}$, so $[AGC] = 20$. Now we just need to find the area of triangle $AFE$ and subtract it from the combined areas of $[ADE]$ and $[ACG]$, since we count it twice. Note that the angle bisector theorem also applies for $\triangle ADE$ and $\frac{AE}{AD} = \frac{1}{5}$, so thus $\frac{EF}{ED} = \frac{1}{6}$ and we find $[AFE] = \frac{1}{6} \cdot 30 = 5$, and the area outside $FDBG$ must be $[ADE] + [AGC] - [AFE] = 30 + 20 - 5 = 45$, and we finally find  $[FDBG] = [ABC] - 45 = 120 -45 = \boxed{\textbf{(D) }75}$, and we are done.

$$=$$

## Solution 7 (Barycentrics)
Let our reference triangle be $\triangle ABC$. Consequently, we have $A=(1,0,0)$, $B=(0,1,0)$, $C=(0,0,1).$ Since $D$ is the midpoint of $\overline{AB}$, we have that $D=(1:1:0)$. Similarly, we have $E=(1:0:1).$ Hence, the line through $D$ and $E$ is given by the equation


$$0 =

$$
\begin{vmatrix}
x & y & z\\
1 & 1 & 0\\
1 & 0 & 1
\end{vmatrix}$$
$$


Additionally, since all points on $\overline{AG}$ are characterized by $(t:1:5)$, we may plug in for $x,y,z$ to get $t=6$. Thus, we have $F=(6:1:5).$ Now, we homogenize the coordinates for $F D, B, G$ to get $F=(\frac{1}{2}, \frac{5}{12}, \frac{1}{12})$, $D=(\frac{1}{2}, \frac{1}{2}, 0)$, $B=(0,1,0)$, $G=(0, \frac{1}{6}, \frac{5}{6})$

Splitting $[FBGD]$ into $[ DBG ] + [ FDG],$ we may now evaluate the two determinants:


$$\begin{vmatrix}
$$\frac{1}{2} & \frac{1}{2} & 0\\$$
0 & 1 & 0\\
$$0 & \frac{1}{6} & \frac{5}{6}$$
$\end{vmatrix}$$$


$$\begin{vmatrix}

$$
\frac{1}{2} & \frac{1}{12} & \frac{5}{12}\\
\frac{1}{2} & \frac{1}{2} & 0\\
0 & \frac{5}{6} & \frac{1}{6}
$$

$\end{vmatrix}.$$$


After simplification, we get $\frac{5}{12}$ and $\frac{5}{24}$, respectively. Summing, we get $\frac{15}{24}.$ Hence, $[FBGD]=\frac{15}{24} \cdot 120 = \fbox{\textbf{(D) }75}.$
$\sim$Math0323
## Solution 8
[File:$201810A_24$.png](https://artofproblemsolving.com/wiki/index.php/File:201810A_24.png)

We want to find ratios. Start off letting [AEF]=1. Then we know [AEF]=[CEF]=1 since AE=CE and they share the same height. Then, also because AE is half of AC, we see that [AEF]=1/4 [ACG] so [ACG]=4.

But we also know [EFGC]=3/4 [ACG], so [EFGC]=3 and then [CFG]=2. If [CFG]=2, then note that [FGB] must be 2*5=10.

Now, we see that [AFD]=5[AED] because EF=1/5 FD (from angle bisector theorem) and they share the same height. Then, because AD=DB, we have [FDB]=[FAD]=5.

Adding these up, we see that the ratio of [BGFD] to [ABC] is $15/24=5/8$. 5/8*120 yields our answer of 75. ~mathboy282
## Solution 9
Draw a nice diagram. Lets find some some areas. We will start by finding $[AED]$. The side length ratio of $\triangle{AED}$ to $\triangle{ACB}$ is $\dfrac{1}{2}$, so the area ratio is $\dfrac{1}{4}$, so $[AED] = \dfrac{1}{4} \cdot 120 = 30$. Lets look for information we have used yet. We still havent used the fact that $AG$ is an angle bisector. This hints at us using the angle bisector theorem. Letting $EF = y$, we have $FD = 5y$, and letting $CG = x$, $GB = 5x$. Now, we have

$$\dfrac{[AEF]}{[AED]} = \dfrac{1}{6} \Longrightarrow [AEF] = \dfrac{1}{6} \cdot 30 = 5, [AFD] = \dfrac{5}{6} \cdot 30 = 25$$

. Doing the same thing with triangles $ACG$ and $AGB$, we find that $[AGB] = 100$, and so $[FDGB] = 100-25 = \boxed{75}$

*~jb2015007*
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2018amc10a/469

*~dolphin7*
## Video Solution by OmegaLearn
https://youtu.be/4_x1sgcQCp4?t=4898

*~pi_is_3.14*
## See Also
