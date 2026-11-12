# 2026 AMC 12A Problem 7

## Problem
What is the value of $(1+i)^{20} + (1-i)^{20}$, where $i=\sqrt{-1}$?

$\textbf{(A)}~-2048 \qquad \textbf{(B)}~-1024 \qquad \textbf{(C)}~0 \qquad \textbf{(D)}~1024 \qquad \textbf{(E)}~2048$

## Solution 1
Observe that $(1+i)^2 = 2i$ and $(1-i)^2 = -2i$. $(1+i)^{20} = (2i)^{10} = -1024$ and $(1-i)^{20} = (-2i)^{10} = -1024$. Therefore the answer is $-1024 + -1024 = -2048$, $\fbox{A}.$
$\newline$
$\sim$ cyrus825

## Solution 2 (Complex Exponentials)
By Euler's Formula, $a + bi = k(\cos(\theta) + i\sin(\theta)) = ke^{i\theta}$, where $\theta = \tan^{-1}\left(\frac b a\right)$, and $k=\sqrt{a^2+b^2}$ by the Pythagorean Theorem. Therefore, we can express both complex numbers as the following:



$$
1  + i = \sqrt{2}e^{i\frac{\pi}{4}}~ \&~  1 - i = \sqrt{2}e^{i\frac{-\pi}{4}}
$$



By DeMoivre's Theorem, $(e^{i\theta})^{n} = e^{in\theta}$. Applying this, we get:



$$
(1+i)^{20}  + (1-i)^{20} = 2^{10}(e^{i\frac{\pi}{4}})^{20} + 2^{10}(e^{i\frac{-\pi}{4}})^{20} = 2^{10}\left(e^{i5\pi} + e^{i5\pi}\right) = 2^{11}\left(e^{i\pi}\right) = -2048~\fbox{\textbf{A}}
$$


$\newline$
$\sim$ Fernat123

### Solution 2.1 (Polar Form)
Alternatively, we can express both numbers directly in polar form without complex exponentials:


$$
1 + i = \sqrt{2}\left(\cos 45^\circ + i\sin 45^\circ\right)
$$




$$
1 - i = \sqrt{2}\left(\cos(-45^\circ) + i\sin(-45^\circ)\right)
$$



By De Moivre's Theorem, raising each to the $20^{\text{th}}$ power yields:


$$
(1+i)^{20} = (\sqrt{2})^{20}\left(\cos(20 \cdot 45^\circ) + i\sin(20 \cdot 45^\circ)\right) = 2^{10}\left(\cos 900^\circ + i\sin 900^\circ\right)
$$




$$
(1-i)^{20} = (\sqrt{2})^{20}\left(\cos(20 \cdot (-45^\circ)) + i\sin(20 \cdot (-45^\circ))\right) = 2^{10}\left(\cos(-900^\circ) + i\sin(-900^\circ)\right)
$$



Summing the two terms, the imaginary components cancel since $\sin(-900^\circ) = -\sin(900^\circ)$:


$$
(1+i)^{20} + (1-i)^{20} = 2^{10}\left(2\cos 900^\circ\right) = 2^{11}\cos 900^\circ
$$



Because $900^\circ \equiv 180^\circ \pmod{360^\circ}$, we have $\cos 900^\circ = \cos 180^\circ = -1$:


$$
2^{11}(-1) = -2048 \implies \boxed{\textbf{(A) } -2048}
$$



~ Cbathine0001

## Solution 3 (Bash)
First, we compute $(1+i)^5$ by expanding $(1+i)^2$ and $(1+i)^3$:


$$
(1+i)^2=1+2i+i^2=2i
$$




$$
(1+i)^3=(1+i)^2(1+i)=2i(1+i)=2i+2i^2=-2+2i
$$




$$
(1+i)^5=(1+i)^2(1+i)^3=2i(-2+2i)=-4i+4i^2=-4-4i
$$



Squaring twice gives $(1+i)^{20}$:


$$
(1+i)^{10}=(-4-4i)^2=16+32i+16i^2=32i
$$




$$
(1+i)^{20}=(32i)^2=1024i^2=-1024
$$



We do the same for $1-i$:


$$
(1-i)^2=1-2i+i^2=-2i
$$




$$
(1-i)^3=(1-i)^2(1-i)=-2i(1-i)=-2i+2i^2=-2-2i
$$




$$
(1-i)^5=(1-i)^2(1-i)^3=-2i(-2-2i)=4i+4i^2=-4+4i
$$



Squaring twice:


$$
(1-i)^{10}=(-4+4i)^2=16-32i+16i^2=-32i
$$




$$
(1-i)^{20}=(-32i)^2=1024i^2=-1024
$$



Therefore,


$$
(1+i)^{20}+(1-i)^{20}=-1024+(-1024)=\boxed{\textbf{(A) }-2048}.
$$



~ [Logibyte](https://artofproblemsolving.com/wiki/index.php/Logibyte)

## Solution 4 (Roots of Unity)
Let $\omega = \frac{\sqrt{2}}{2} + \frac{\sqrt{2}}{2}i$ be a primitive $8$th root of unity. Then $1 + i = \sqrt{2}\,\omega$ and $1 - i = \sqrt{2}\,\omega^7$, since $\omega^7 = \overline{\omega} = \frac{\sqrt{2}}{2} - \frac{\sqrt{2}}{2}i$.

Therefore


$$
(1 + i)^{20} + (1 - i)^{20} = (\sqrt{2})^{20}\left(\omega^{20} + \omega^{140}\right) = 2^{10}\left(\omega^{20} + \omega^{140}\right).
$$



Because $\omega^8 = 1$, we reduce the exponents mod $8$. We have $20 \equiv 4 \pmod{8}$ and $140 \equiv 4 \pmod{8}$, so both terms equal $\omega^4$. Since $\omega$ is a primitive $8$th root of unity, $\omega^4$ is the $8$th root of unity directly opposite $1$ on the unit circle, so $\omega^4 = -1$.

The expression equals $1024(-1 - 1) = \boxed{\textbf{(A)}~-2048}$.

~ Aeioujyot

## Solution 5 (Conjugates)
Notice that $1-i=\overline{1+i}$ by the definition of conjugates. Again notice that $\overline{z}^n=\overline{z^n}$ by properties of conjugates, and also that $z+\overline z=2\Re(z)$. Hence we have the following if $z=1+i$:

- $(1+i)^{20}+(1-i)^{20}=2\Re((1+i)^{20})$
- $\Re((1+i)^{20})=\Re\left(\left(\sqrt 2e^{i\pi /4}\right)^{20}\right)=\Re(2^{10}e^{5i\pi})=-2^{10}$

Hence our desired value is $2\cdot -2^{10}=-2^{11}=\boxed{-2048\hspace{1mm}\textbf{(A)}}$.

~singularity1

## Solution 6 (Similar to Others)
Firstly, in order to make the coefficients of 1 and $i$ the same we *must* require that $\cos$ and $\sin$ are the same. This happens when $\theta = \frac{\pi}{4}$. Thus, considering $re^{i \theta}$, we see both expressions evaluate to $\sqrt{2} \cdot e^{i \frac{\pi}{4}}$ and $\sqrt{2} \cdot e^{i \frac{-\pi}{4}}$ respectively. Thus we have



$$
(\sqrt{2} e^{i \frac{\pi}{4}})^{20} + (\sqrt{2} e^{i \frac{-\pi}{4}})^{20}
$$




$$
2^{10} e^{i5\pi} + 2^{10} e^{-i5\pi}
$$




$$
-2^{10} - 2^{10}
$$




$$
-1024-1024
$$




$$
= \boxed{-2048}.
$$



~Pinotation

## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ

## Video Solution 2 and 3 by MathIsFun
https://youtu.be/JRWnRtZNW9o?si=GRCRBI6CO0P1pcnp&t=306 (Binomial expansion)

https://youtu.be/JRWnRtZNW9o?si=tUuHKTkbgmfkyJ45&t=795 (Polar Coordinates)
