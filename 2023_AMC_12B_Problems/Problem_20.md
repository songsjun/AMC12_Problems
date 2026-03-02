# 2023 AMC 12B Problem 20

## Problem
Cyrus the frog jumps 2 units in a direction, then 2 more in another direction. What is the probability that he lands less than 1 unit away from his starting position?

$\textbf{(A)}~\frac{1}{6}\qquad\textbf{(B)}~\frac{1}{5}\qquad\textbf{(C)}~\frac{\sqrt{3}}{8}\qquad\textbf{(D)}~\frac{\arctan \frac{1}{2}}{\pi}\qquad\textbf{(E)}~\frac{2\arcsin \frac{1}{4}}{\pi}$
## Solution 1
[center|500px](https://artofproblemsolving.com/wiki/index.php/File:2023AMC12BP20.png)

Let Cyrus's starting position be S. WLOG, let the place Cyrus lands at for his first jump be O. From O, Cyrus can reach all the points on \odot O. The probability that Cyrus will land less than 1 unit away from S is $\frac{4 \alpha }{ 2 \pi}.$

$$\sin \alpha = \frac{ \frac12 }{2} = \frac14, \quad \alpha = \arcsin \frac14$$

Therefore, the answer is


$$\frac{4 \arcsin \frac14 }{ 2 \pi} = \boxed{\textbf{(E) } \frac{2 \arcsin \frac{1}{4}}{\pi}}$$


~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 2
Denote by $A_i$ the position after the ith jump.
Thus, to fall into the region centered at $A_0$ and with radius 1, $\angle A_2 A_1 A_0 < 2 \arcsin \frac{1/2}{2} = 2 \arcsin \frac{1}{4}.$

Therefore, the probability is
 $$\frac{2 \cdot 2 \arcsin \frac{1}{4}}{2 \pi} = \boxed{\textbf{(E) } \frac{2 \arcsin \frac{1}{4}}{\pi}}.$$

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## Solution 3(coord bash)
Let the orgin be the starting point of frog. Then, WLOG assume that after the first jump, it is at the point (2,0). Then, the range of all possible places the frog can jump to at its second jump is the circle with equation $(x-2)^2+y^2=2^2.If$ it landed 1 unit within its starting point (the orgin), then it is inside the circle $x^2+y^2=1.$ We clearly want the intersection point. So we're trying to solve the system of equations $x^2+y^2=1$ and $(x-2)^2+y^2=2^2.$ We have $x=\frac{1}{4},$ so $y=\pm\frac{\sqrt{15}}{4}.$ Therefore, our desired answer would be $\frac{\arcsin{\frac{\sqrt{15}}{8}}}{\pi} (t$he angle we want divided by $2\pi).$ Since


$$\arcsin{\frac{\sqrt{15}}{8}}=\arccos{\frac{7}{8}}=\arccos{(1-2 \cdot (\frac{1}{4})^{2})}=2\arcsin{\frac{1}{4}}$$


where the last step holds by the double angle formula, our answer is $\boxed{(E)\frac{2\arcsin{\frac{1}{4}}}{\pi}}.$
~[Ddk001](https://artofproblemsolving.com/wiki/index.php/Ddk001)
## Solution 4 - Law of Cosines and Double Angle Formula
Let A be Cyrus's starting point, B be the first point he jumps to (AB = 2), and C be the second point he jumps to (BC = 2). Let angle ABC be k, such that AC = 1. The probability of AC < 1 would therefore be $\frac{2k}{360} (s$ince C could be on either side of AB so there are two possible areas of having AC < 1) which simplifies to $\frac{k}{180}.$ Converting to radians gives us $\frac{k}{\pi}.$ To find k, we use the law of cosines.


$$AC^2 = AB^2 + BC^2 - 2 \cdot AB \cdot BC \cdot \cos k 1^2 = 2^2 + 2^2 - 2 \cdot 2 \cdot 2 \cdot \cos k 1 = 4 + 4 - 8 \cos k 8 \cos k = 7 \cos k = \frac{7}{8} k = \arccos\left(\frac{7}{8}\right) = \arcsin\left(\sqrt{1 - \left(\frac{7}{8}\right)^2}\right) = \arcsin\left(\sqrt{\frac{15}{64}}\right) = \arcsin\left(\frac{1}{4} \sqrt{\frac{15}{4}}\right) = \arcsin\left(\frac{1}{4} \sqrt{1 - \left(\frac{1}{4}\right)^2}\right) = \arcsin\left(\sin\left(\arcsin\left(\frac{1}{4}\right)\right) \cos\left(\arcsin\left(\frac{1}{4}\right)\right)\right) = \arcsin\left(\sin\left(2 \arcsin\left(\frac{1}{4}\right)\right)\right) = 2 \arcsin\left(\frac{1}{4}\right)$$


The probability is $\frac{k}{\pi} = \frac{2 \arcsin\left(\frac{1}{4}\right)}{\pi}$

which is E.
## Solution 5 - Complex Number and Double Angle Formula
[thumb|center|400px| ](https://artofproblemsolving.com/wiki/index.php/Image:2023_amc_12_A_p20.png)

The frog jumps 2 units in one direction, which we can represent as  $z_1=2e^{ia}$ , where  a  is the angle in radians. Then, the frog jumps another 2 units in a different direction, represented as  $z_2=2e^{ib}$ , where  b  is the angle in radians.

The total displacement from the starting position is  $z_3=z_1 + z_2=2e^{ia}+2e^{ib}$ .

We need to find the condition under which  |$z_3$| <= 1 . This translates to:
$$|2e^{ia} + 2e^{ib}| <= 1$$

$$|e^{ia} + e^{ib}| <= \frac{1}{2}$$


$$
e^{ia} + e^{ib} = \cos(a) + i\sin(a) + \cos(b) + i\sin(b)
= (\cos(a) + \cos(b)) + i(\sin(a) + \sin(b))
$$


The magnitude squared of this sum is:

$$
|e^{ia} + e^{ib}|^2 = (\cos(a) + \cos(b))^2 + (\sin(a) + \sin(b))^2
= \cos^2(a) + 2\cos(a)\cos(b) + \cos^2(b) + \sin^2(a) + 2\sin(a)\sin(b) + \sin^2(b)
= 2 + 2(\cos(a)\cos(b) + \sin(a)\sin(b))
= 2 + 2\cos(a - b)
$$


Thus:

$$
2 + 2\cos(a - b) <= \frac{1}{4}
2\cos(a - b) <= -\frac{7}{4}
\cos(a - b) <= -\frac{7}{8}
$$


Therefore, our desired answer would be $\frac{\arccos{\frac{7}{8}}}{\pi} (t$he angle we want divided by $2\pi).$ Since


$$\arccos{\frac{7}{8}}=\arccos{(1-2 \cdot (\frac{1}{4})^{2})}=2\arcsin{\frac{1}{4}}$$


where the last step holds by the double angle formula, our answer is $\boxed{(E)\frac{2\arcsin{\frac{1}{4}}}{\pi}}.$

~[https://artofproblemsolving.com/wiki/index.php/User:Cyantist luckuso]
## Video Solution
https://youtu.be/hBf_SVKK9tE

*~MC*
## Video Solution 1 by OmegaLearn
https://youtu.be/nGZ9goJmg4Q
## Video Solution
https://youtu.be/_i_d-C1cjyI

*~Steven Chen (Professor Chen Education Palace, www.professorchenedu.com)*
## See Also
