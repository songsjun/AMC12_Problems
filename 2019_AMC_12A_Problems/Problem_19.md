# 2019 AMC 12A Problem 19

## Problem
In $\triangle ABC$ with integer side lengths, $\cos A = \frac{11}{16}, \cos B = \frac{7}{8},$ and $\cos C = -\frac{1}{4}.$ What is the least possible perimeter for $\triangle ABC$?

$\textbf{(A) } 9 \qquad \textbf{(B) } 12 \qquad \textbf{(C) } 23 \qquad \textbf{(D) } 27 \qquad \textbf{(E) } 44$
## Solutions
### Solution 1
Notice that by the Law of Sines, a:b:c = $\sin{A}$:$\sin{B}$:$\sin{C},$ so let's flip all the cosines using $\sin^{2}{x} + \cos^{2}{x} = 1 (\sin{x}$ is positive for $0^{\circ}$ < x < $180^{\circ}$, so we're good there).

$\sin A=\frac{3\sqrt{15}}{16}, \qquad \sin B= \frac{\sqrt{15}}{8}, \qquad \text{and} \qquad\sin C=\frac{\sqrt{15}}{4}$

These are in the ratio 3:2:4, so our minimal triangle has side lengths 2, 3, and 4. $\boxed{\textbf{(A) } 9}$ is our answer.
### Solution 2
$\angle ACB$ is obtuse since its cosine is negative, so we let the foot of the altitude from C to AB be H. Let AH=11x, AC=16x, BH=7y, and BC=8y. By the Pythagorean Theorem, CH=$\sqrt{256x^2-121x^2}=3x\sqrt{15}$ and CH=$\sqrt{64y^2-49y^2}=y\sqrt{15}.$ Thus, y=3x. The sides of the triangle are then 16x, 11x+7(3x)=32x, and 24x, so for some integers a,b, 16x=a and 24x=b, where a and b are minimal. Hence, $\frac{a}{16}=\frac{b}{24},$ or 3a=2b. Thus the smallest possible positive integers a and b that satisfy this are a=2 and b=3, so $x=\frac{1}{8}.$ The sides of the triangle are 2, 3, and 4, so $\boxed{\textbf{(A) } 9}$ is our answer.
### Solution 3
Using the law of cosines, we get the following equations:


$$
c^2=a^2+b^2+\frac{ab}{2}
b^2=a^2+c^2-\frac{7ac}{4}
a^2=b^2+c^2-\frac{11bc}{8}
$$


Substituting $a^2+c^2-\frac{7ac}{4}$ for $b^2 ina^2=b^2+c^2-\frac{11bc}{8}$ and simplifying, we get the following:
$$14a+11b=16c$$

Note that since a, b, c are integers, we can solve this for integers. By some trial and error, we get that (a,b,c) = (3,2,4). Checking to see that this fits the triangle inequality, we find out that this indeed works. Hence, our answer is 3+2+4 = $\boxed{\textbf{(A) } 9}$

*~hiker*
### Solution 4
Similar to solution 3, we will get the following by the law of cosines:


$$
\begin{align} a^2 + b^2 - c^2 = - \frac{1}{2} ab\\ b^2 + c^2 - a^2 = \frac{11}{8} bc\\ a^2 + c^2 - b^2 = \frac{7}{4} ac \end{align}
$$


By adding equations (1), (2) and (3) together, we will obtain:

$$
\begin{align*} a^2 + b^2 + c^2 &= - \frac{1}{2} ab + \frac{11}{8} bc + \frac{7}{4} ac & \text{(4)} \end{align*}
$$


Subtracting (2) from (4) will give us:

$$
\begin{align*} (a^2 + b^2 + c^2) - (b^2 + c^2 - a^2) &= (- \frac{1}{2} ab + \frac{11}{8} bc + \frac{7}{4} ac) - \frac{11}{8}\\ 2a^2 &= - \frac{1}{2} ab + \frac{7}{4} ac\\ 2a &= - \frac{1}{2} b + \frac{7}{4} c\\ 16a &= 14c - 4b & \text{(a)} \end{align*}
$$


Again, we subtract (3) from (4) and obtain:

$$
\begin{align*} 16b &= 11c - 4a & \text{(b)} \end{align*}
$$


By adding equations (a) and (b):

$$
\begin{align*} 16a + 16b &= 14c - 4b + 11c - 4a\\ 20(a+b) &= 25c\\ 4(a+b) &= 5c \end{align*}
$$


Since all a, b and c are integers, the smallest possibility is a+$b=5$ and $c=4$. Thus, $a+b+c=4+5=\boxed{\textbf{(A) } 9}$

~[https://artofproblemsolving.com/wiki/index.php/User:Andy_li0805 Andy_li0805]
## Video Solution1
https://youtu.be/E8gk7VkLxos

*~Education, the Study of Everything*
## See Also
