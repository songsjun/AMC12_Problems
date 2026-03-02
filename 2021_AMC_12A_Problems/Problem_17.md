# 2021 AMC 12A Problem 17

> This problem is the same as [2021 AMC 10A #17](https://artofproblemsolving.com/wiki/index.php/2021_AMC_10A_Problems/Problem_17) and [2021 AMC 12A #17](https://artofproblemsolving.com/wiki/index.php/2021_AMC_12A_Problems/Problem_17).
## Problem
Trapezoid ABCD has $\overline{AB}$\parallel$\overline{CD},BC=CD=43,$ and $\overline{AD}$\perp$\overline{BD}.$ Let O be the intersection of the diagonals $\overline{AC}$ and $\overline{BD},$ and let P be the midpoint of $\overline{BD}.$ Given that OP=11, the length of AD can be written in the form $m\sqrt{n},$ where m and n are positive integers and n is not divisible by the square of any prime. What is m+n?

$\textbf{(A) }65 \qquad \textbf{(B) }132 \qquad \textbf{(C) }157 \qquad \textbf{(D) }194\qquad \textbf{(E) }215$
## Diagram
> [Asymptote diagram - not rendered in Markdown]

```asy
/* Made by MRENTHUSIASM */ size(300); pair A, B, C, D, O, P; C = (43,0); D = (0,0); B = intersectionpoints(Circle(C,43),Circle(D,66))[0]; A = intersectionpoints(Circle(D,4*sqrt(190)),B--B+100*dir(180))[1]; P = midpoint(B--D); O = intersectionpoint(A--C,B--D); dot("$C$",C,1.5*SE,linewidth(4)); dot("$D$",D,1.5*SW,linewidth(4)); dot("$B$",B,1.5*NE,linewidth(4)); dot("$A$",A,1.5*NW,linewidth(4)); dot("$P$",P,1.5*N,linewidth(4)); dot("$O$",O,1.5*S,linewidth(4)); markscalefactor=0.25; draw(rightanglemark(A,D,O),red); draw(A--B--C--D--cycle^^A--C^^B--D^^C--P); label("$43$",B--C,E); label("$43$",C--D,S); label("$11$",midpoint(O--P),NW);
```

*~MRENTHUSIASM*
## Solution 1 (Similar Triangles and Pythagorean Theorem)
Angle chasing* reveals that $\triangle BPC\sim\triangle BDA,$ therefore

$$
2=\frac{BD}{BP}=\frac{AB}{BC}=\frac{AB}{43},
or AB=86.
$$


Additional angle chasing shows that $\triangle ABO\sim\triangle CDO,$ therefore
$$2=\frac{AB}{CD}=\frac{BO}{OD}=\frac{BP+11}{BP-11},$$
or BP=33 and BD=66.

Since $\triangle ADB$ is right, the Pythagorean theorem implies that
$$AD=\sqrt{86^2-66^2}=4\sqrt{190}.$$
The answer is $4+190=\boxed{\textbf{(D) }194}.$

- Angle Chasing: If we set $\angle DBC = \alpha,$ then we know that $\angle DCB = 180^\circ-2\alpha$ because $\triangle DBC$ is isosceles. Then, $\angle BCP = 90^\circ-\alpha,$ so $\angle BPC$ is a right angle. Because $\angle BDC = \alpha$ and $\overline{AB}$\parallel$\overline{DC},$ we conclude that $\angle ABD = \alpha$ too. Lastly, because $\triangle BPC$ and $\triangle BDA$ are both right triangles, they are similar by AA.

*~mn28407 (Solution)*

*~mm (Angle Chasing Remark)*

*~eagleye ~MRENTHUSIASM ~charyyu83 (Minor Edits)*
## Solution 2 (Similar Triangles, Areas, Pythagorean Theorem)
Since $\triangle BCD$ is isosceles with base $\overline{BD},$ it follows that median $\overline{CP}$ is also an altitude. Let OD=x and CP=h, so PB=$x+11$.

Since $\angle AOD=\angle COP$ by vertical angles, we conclude that $\triangle AOD\sim\triangle COP$ by AA, from which $\frac{AD}{CP}=\frac{OD}{OP},$ or AD=CP$\cdot\frac{OD}{OP}=h\cdot\frac{x}{11}.$ Let the brackets denote areas. Notice that [AOD]=[BOC] (By the same base and height, we deduce that [ACD]=[BDC]. Subtracting [OCD] from both sides gives [AOD]=[BOC].). Doubling both sides produces

$$
\begin{align*} 2[AOD]&=2[BOC] \\ OD\cdot AD&=OB\cdot CP \\ x\left(\frac{hx}{11}\right)&=(x+22)h \\ x^2&=11(x+22). \end{align*}
$$

Rearranging and factoring result in $(x-22)(x+11)=0$, from which $x=22$.

Applying the Pythagorean Theorem to right $\triangle CPB,$ we have $h=\sqrt{43^2-33^2}=\sqrt{(43+33)(43-33)}=\sqrt{760}=2\sqrt{190}.$ Finally, we get AD=h$\cdot\frac{x}{11}=4\sqrt{190},$ so the answer is $4+190=\boxed{\textbf{(D) }194}.$

*~MRENTHUSIASM*
## Solution 3 (Short)
Let CP = y. CP a is perpendicular bisector of DB. Then, let DO = x, thus DP = PB = 11+x.

(1) $\triangle CPO \sim \triangle ADO,$ so we get $\frac{AD}{x} = \frac{y}{11},$ or AD = $\frac{xy}{11}.$

(2) Applying Pythagorean Theorem on $\triangle CDP$ gives $(11+x)^2 + y^2 = 43^2.$

(3) $\triangle BPC \sim \triangle BDA$ with ratio 1:2, so AD = $2y$ using the fact that P is the midpoint of BD.

Thus, $\frac{xy}{11} = 2$y, or $x = 22. And y =\sqrt{43^2 - 33^2} = 2 \sqrt{190},$ so AD = 4 $\sqrt{190}$ and the answer is $4+190=\boxed{\textbf{(D) }194}.$

*~ccx09*
## Solution 4 (Law of Sines and Similar Triangles)
This solution will refer to the diagram section at the top of this page.

We know $\angle ABD = \angle BDC = \angle DBC.$ Let PB = 11 + x. Notice that $\triangle ABD$ is similar to $\triangle DOC,$ so $\frac{AB}{43} = \frac{22 + x}{x} \implies AB = \frac{43(22 + x)}{x}.$ Now we apply the Law of Sines to isosceles triangle $\triangle DCB$:

$\frac{\sin(\angle ABD)}{43} = \frac{\sin(180^\circ - 2\angle ABD)}{22 + 2x} = \frac{2\sin(\angle ABD)\cos(\angle ABD)}{22 + 2x}$

$\frac{1}{43} = \frac{\cos(\angle ABD)}{11 + x} \implies \cos(\angle ABD) = \frac{11 + x}{43}$

From right triangle $\triangle BAD$ we already know that $\cos(\angle ABD) = \frac{BD}{AB} = \frac{(22 + 2x)x}{43(22 + x)}.$

Setting these equations equal to each other gives us:
$$\frac{(22 + 2x)x}{43(22 + x)} = \frac{11 + x}{43}$$

$$x = 22 \implies BD = 2(11 + x) = 66, AB = \frac{43 \cdot 44}{22} = 86.$$

So AD = $\sqrt{86^2 - 66^2} = 4\sqrt{190}.$ Ans = $\boxed{194}.$

*~grogg007*
## Solution 5 (Extending the Line)
Observe that $\triangle BPC$ is congruent to $\triangle DPC$; both are similar to $\triangle BDA.$ Let's extend $\overline{AD}$ and $\overline{BC}$ past points D and C respectively, such that they intersect at a point E. Observe that $\angle BDE$ is 90 degrees, and that $\angle DBE$\cong $\angle PBC$\cong $\angle DBA \implies \angle DBE$\cong $\angle DBA.$ Thus, by ASA, we know that $\triangle ABD$\cong $\triangle EBD,$ thus, AD = ED, meaning D is the midpoint of AE.
Let M be the midpoint of $\overline{DE}.$ Note that $\triangle CME$ is congruent to $\triangle BPC,$ thus BC = CE, meaning C is the midpoint of $\overline{BE}.$

Therefore, $\overline{AC}$ and $\overline{BD}$ are both medians of $\triangle ABE.$ This means that O is the centroid of $\triangle ABE$; therefore, because the centroid divides the median in a 2:1 ratio, $\frac{BO}{2} = DO = \frac{BD}{3}.$ Recall that P is the midpoint of BD; DP = $\frac{BD}{2}.$ The question tells us that OP = 11; DP-DO=11; we can write this in terms of DB; $\frac{DB}{2}-\frac{DB}{3} = \frac{DB}{6} = 11 \implies DB = 66.$

We are almost finished. Each side length of $\triangle ABD$ is twice as long as the corresponding side length $\triangle CBP$ or $\triangle CPD,$ since those triangles are similar; this means that AB = 2 $\cdot 43 = 86.$ Now, by Pythagorean theorem on $\triangle ABD, AB^{2} - BD^{2} = AD^{2} \implies 86^{2}-66^{2} = AD^{2} \implies AD = \sqrt{3040} \implies AD = 4 \sqrt{190}.$

The answer is 4+190 = $\boxed{\textbf{(D) }194}.$

*~ihatemath123*
## Solution 6
Since P is the midpoint of isosceles triangle BCD, it would be pretty easy to see that CP\perp BD. Since AD\perp BD as well, AD\parallel CP. Connecting AP, it’s obvious that [ADC]=[ADP]. Since DP=BP, [APB]=[ADC].

Since P is the midpoint of BD, the height of $\triangle APB$ on side AB is half that of $\triangle ADC$ on CD. Since [APB]=[ADC], AB=2CD.

As a basic property of a trapezoid, $\triangle AOB \sim \triangle COD,$ so $\frac{OB}{OD}=\frac{AB}{CD}=2,$ or OB=2OD. Letting OD=x, then PB=DP=11+x, and OB=22+x. Hence $22+x=2x$ and $x=22$.

Since $\triangle AOD \sim \triangle COP, \frac{AD}{PC}=\frac{OD}{OP}=2.$ Since PD=$11+22=$33, PC=$\sqrt{43^2-33^2}=\sqrt{760}.$

So, AD=$2\sqrt{760}=4\sqrt{190}.$ The correct answer is $\boxed{\textbf{(D) }194}.$
## Solution 7 (Coordinate Geometry)
Let D be the origin of the cartesian coordinate plane, B lie on the positive x-axis, and A lie on the negative y-axis. Then let the coordinates of B = ($2a$,0), A = (0, -$2b$). Then the slope of AB is $\frac{b}{a}.$ Since AB \parallel CD the slope of CD is the same. Note that as $\triangle DCB$ is isosceles C lies on x = a. Thus since CD has equation $y =\frac{b}{a}$x (D is the origin), C = (a,b). Therefore AC has equation $y =\frac{3b}{a}$x - $2b$ and intersects BD (x-axis) at O =$\left(\frac{2}{3}$a, $0\right).$ The midpoint of BD is P = (a,0), so OP = $\frac{a}{3} = 11,$ from which $a = 33$. Then by Pythagorean theorem on $\triangle DPC (\triangle DBC$ is isosceles), we have $b =\sqrt{43^2 - 33^2} = 2\sqrt{190},$ so $2b=4\sqrt{190}.$

Finally, the answer is $4+190=\boxed{\textbf{(D) }194}.$

*~Aaryabhatta1*
## Solution 8 (Trigonometry)
[thumb|center|600px|](https://artofproblemsolving.com/wiki/index.php/Image:2021_12A_p17.png)

set $\angle BDC = \theta$

$$BD = 2*DP = 2*43*\cos{\theta}$$

AB = $\frac{BD}{\cos{\angle {DBA}}} = \frac{BD}{\cos{\theta}}= 2 \cdot 43 \cdot \frac{\cos{\theta}}{\cos{\theta}}=86$

$$\frac{OP}{DO}=\frac{CP}{AD}$$


$$\frac{11}{43\cdot \cos{\theta}-11}=\frac{43\cdot\sin{\theta}}{86\cdot \sin{\theta}}$$


$$\cos{\theta}=\frac{33}{43}$$

$$AD=86\cdot \sin{\theta}=2 \sqrt{760}=4\sqrt{190}=\boxed{\textbf{(D)}194}.$$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]

*~latex edits by flyingkinder123*
## Video Solution by OmegaLearn (Using Similar Triangles, Pythagorean Theorem)
https://youtu.be/gjeSGJy_ld4

*~pi_is_3.14*

==Video Solution by Scholars Foundation
https://youtu.be/kKHN6h1BA2A?si=scac6uWEg1rbep0k
## Video Solution by Mathematical Dexterity
https://www.youtube.com/watch?v=QzAVdsgBBqg
## See also
